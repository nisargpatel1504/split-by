export function login(res, req) {
  req.send('<a href="/auth/google">Sign in with Google</a>');
}
