
export function success(data: any, meta?: any) {
  return { success: true, data, meta };
}

export function failure(message: string) {
  return { success: false, error: { message } };
}
