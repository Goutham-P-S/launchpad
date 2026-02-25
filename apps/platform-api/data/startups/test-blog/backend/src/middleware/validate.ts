
export function validate(schema: any) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    req.body = result.data;
    next();
  };
}
