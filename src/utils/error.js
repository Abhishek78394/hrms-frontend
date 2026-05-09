export const formatApiError = (error) => error?.response?.data?.message || error?.message || "Something went wrong";
