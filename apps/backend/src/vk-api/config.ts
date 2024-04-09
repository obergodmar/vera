export const RATE_LIMIT = 20;
export const RATE_LIMIT_WINDOW = 3000;
export const EXECUTE_MAX_REQUESTS = 25;
export const API_DEFAULT_TIMEOUT = 10 * 1000;
export const API_MIN_RETRY_TIMEOUT = 500;
export const API_MAX_RETRY_TIMEOUT = 20 * 1000;
export const API_USER_FIELDS = [
  'id',
  'first_name',
  'first_name_gen',
  'first_name_acc',
  'last_name',
  'last_name_gen',
  'last_name_acc',
  'sex',
  'has_photo',
  'photo_id',
  'photo_50',
  'photo_100',
  'photo_200',
  'contact_name',
  'occupation',
  'bdate',
  'city',
  'screen_name',
  'online_info',
  'verified',
  'blacklisted',
  'blacklisted_by_me',
  'can_call',
  'can_write_private_message',
  'can_send_friend_request',
  'can_invite_to_chats',
  'friend_status',
  'followers_count',
  'profile_type',
  'contacts',
  'employee_mark',
  'employee_working_state',
  'is_service_account',
  'image_status',
];

export const API_GROUP_FIELDS = [
  'id',
  'name',
  'screen_name',
  'type',
  'photo_id',
  'photo_50',
  'photo_100',
  'members_count',
  'member_status',
  'verified',
  'is_closed',
  'can_message',
  'online_info',
  'deactivated',
  'activity',
  'ban_info',
  'is_messages_blocked',
  'can_post_donut',
  'site',
  'reposts_disabled',
  'description',
  'action_button',
  'menu',
  'role',
];

export const API_VERSION = '5.226';
export const API_ERROR_AUTH = 5;
export const API_ERROR_CAPTCHA = 14;
export const API_ERROR_SECTION_DISABLED = 43;
export const API_ERROR_TOO_MANY = 6;
export const API_ERROR_FLOOD = 9;
export const API_ERROR_METHOD_DISABLED = 23;
export const API_ERROR_RATE_LIMIT = 29;
export const API_ERROR_SERVER = 10;
export const API_ERROR_UNKNOWN = 1;
export const API_ERROR_USER_DEACTIVATED = 3610;
export const API_ERROR_UNKNOWN_USER = 39;
