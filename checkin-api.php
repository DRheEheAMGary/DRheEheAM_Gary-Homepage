<?php
/**
 * Plugin Name: 打卡数据 API
 * Plugin URI:  https://dreamgary.cn
 * Description: 为个人主页提供打卡数据存储、用户注册等 REST API 端点
 * Version:     1.1.0
 * Author:      DRheEheAM_Gary
 */

defined('ABSPATH') or die();

// ==================== CF Turnstile 配置 ====================
define('CHECKIN_TURNSTILE_SECRET', '0x4AAAAAADCXU6Vku-xXuX5pmDeLDoC-Qng');

// ==================== 注册 REST API 端点 ====================

add_action('rest_api_init', function () {

    // POST /wp-json/checkin/v1/register — 用户注册
    register_rest_route('checkin/v1', '/register', [
        'methods'             => 'POST',
        'callback'            => 'checkin_register',
        'permission_callback' => '__return_true',
    ]);

    // POST /wp-json/checkin/v1/verify-turnstile — 验证 Turnstile
    register_rest_route('checkin/v1', '/verify-turnstile', [
        'methods'             => 'POST',
        'callback'            => 'checkin_verify_turnstile',
        'permission_callback' => '__return_true',
    ]);

    // GET /wp-json/checkin/v1/dates — 获取当前用户所有打卡日期
    register_rest_route('checkin/v1', '/dates', [
        'methods'             => 'GET',
        'callback'            => 'checkin_get_dates',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // POST /wp-json/checkin/v1/dates — 添加今日打卡日期
    register_rest_route('checkin/v1', '/dates', [
        'methods'             => 'POST',
        'callback'            => 'checkin_add_date',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // GET /wp-json/checkin/v1/fortune — 获取今日运势
    register_rest_route('checkin/v1', '/fortune', [
        'methods'             => 'GET',
        'callback'            => 'checkin_get_fortune',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // POST /wp-json/checkin/v1/fortune — 保存今日运势
    register_rest_route('checkin/v1', '/fortune', [
        'methods'             => 'POST',
        'callback'            => 'checkin_save_fortune',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
});

// ==================== Turnstile 验证 ====================

/**
 * 验证 Cloudflare Turnstile token
 */
function checkin_verify_turnstile($request) {
    $token = sanitize_text_field($request->get_param('token'));

    if (empty($token)) {
        return new WP_Error('missing_token', '缺少验证令牌', ['status' => 400]);
    }

    $result = checkin_turnstile_verify($token);
    if (is_wp_error($result)) {
        return $result;
    }

    return ['success' => true];
}

/**
 * 通用 Turnstile 验证函数
 */
function checkin_turnstile_verify($token) {
    $response = wp_remote_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
        'body' => [
            'secret'   => CHECKIN_TURNSTILE_SECRET,
            'response' => $token,
        ],
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('verify_failed', '验证服务异常', ['status' => 500]);
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (empty($body['success'])) {
        return new WP_Error('turnstile_failed', '人机验证失败，请重试', ['status' => 400]);
    }

    return true;
}

// ==================== 打卡数据 ====================

function checkin_get_dates() {
    $user_id = get_current_user_id();
    $dates   = get_user_meta($user_id, 'daily_checkin_dates', true);
    return is_array($dates) ? $dates : [];
}

function checkin_add_date($request) {
    $user_id = get_current_user_id();
    $dates   = get_user_meta($user_id, 'daily_checkin_dates', true);
    if (!is_array($dates)) $dates = [];

    $date = sanitize_text_field($request->get_param('date'));
    if (!in_array($date, $dates)) {
        $dates[] = $date;
        update_user_meta($user_id, 'daily_checkin_dates', $dates);
    }
    return $dates;
}

function checkin_get_fortune() {
    $user_id = get_current_user_id();
    $date    = date('Y-m-d');
    return get_user_meta($user_id, 'daily_fortune_' . $date, true) ?: null;
}

function checkin_save_fortune($request) {
    $user_id = get_current_user_id();
    $date    = date('Y-m-d');
    $params  = $request->get_params();

    $fortune = [
        'value' => isset($params['value']) ? intval($params['value']) : 0,
        'luck'  => isset($params['luck']) ? sanitize_text_field($params['luck']) : '',
    ];

    update_user_meta($user_id, 'daily_fortune_' . $date, $fortune);
    return $fortune;
}

// ==================== 用户注册（含 Turnstile） ====================

function checkin_register($request) {
    $username = sanitize_text_field($request->get_param('username'));
    $email    = sanitize_email($request->get_param('email'));
    $password = $request->get_param('password');
    $turnstile_token = sanitize_text_field($request->get_param('turnstile_token'));

    // 基础验证
    if (empty($username) || empty($email) || empty($password)) {
        return new WP_Error('missing_fields', '请填写所有字段', ['status' => 400]);
    }
    if (strlen($password) < 6) {
        return new WP_Error('weak_password', '密码至少6位', ['status' => 400]);
    }
    if (username_exists($username) || email_exists($email)) {
        return new WP_Error('register_invalid', '注册信息无效，请重试', ['status' => 400]);
    }

    // Turnstile 验证
    if (empty($turnstile_token)) {
        return new WP_Error('missing_turnstile', '请完成人机验证', ['status' => 400]);
    }
    $verify = checkin_turnstile_verify($turnstile_token);
    if (is_wp_error($verify)) {
        return $verify;
    }

    // 创建用户
    $user_id = wp_insert_user([
        'user_login' => $username,
        'user_email' => $email,
        'user_pass'  => $password,
        'role'       => 'subscriber',
    ]);

    if (is_wp_error($user_id)) {
        return new WP_Error('register_failed', $user_id->get_error_message(), ['status' => 400]);
    }

    return [
        'message'  => '注册成功',
        'user_id'  => $user_id,
        'username' => $username,
    ];
}
