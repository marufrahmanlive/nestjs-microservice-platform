export const AUTH_PATTERNS = {
  REGISTER: 'auth.user.register',
  LOGIN: 'auth.user.login',
  LOGOUT: 'auth.user.logout',
  REFRESH_TOKEN: 'auth.token.refresh',
  VALIDATE_TOKEN: 'auth.token.validate',
};

export const USER_PATTERNS = {
  FIND_BY_ID: 'user.findById',
  FIND_BY_EMAIL: 'user.findByEmail',
  LIST: 'user.list',
  CREATE: 'user.create',
  UPDATE: 'user.update',
  DELETE: 'user.delete',
};

export const TODO_PATTERNS = {
  CREATE: 'todo.create',
  FIND_BY_ID: 'todo.findById',
  FIND_BY_USER: 'todo.findByUser',
  FIND_BY_STATUS: 'todo.findByStatus',
  UPDATE: 'todo.update',
  DELETE: 'todo.delete',
  LIST: 'todo.list',
};

export const BOOK_PATTERNS = {
  CREATE: 'book.create',
  FIND_BY_ID: 'book.findById',
  FIND_BY_USER: 'book.findByUser',
  FIND_BY_READ_STATUS: 'book.findByReadStatus',
  FIND_BY_GENRE: 'book.findByGenre',
  UPDATE: 'book.update',
  DELETE: 'book.delete',
  LIST: 'book.list',
};

export const EVENT_PATTERNS = {
  NOTIFICATION_SEND: 'notification.send',
  USER_CREATED: 'user.created',
  USER_DELETED: 'user.deleted',
};

export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE';
export const USER_SERVICE_TOKEN = 'USER_SERVICE';
export const TODOS_SERVICE_TOKEN = 'TODOS_SERVICE';
export const BOOKS_SERVICE_TOKEN = 'BOOKS_SERVICE';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
