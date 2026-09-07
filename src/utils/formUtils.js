/**
 * Automatically maps Laravel API 422 validation errors to Ant Design Form fields.
 * 
 * @param {object} error - The caught Axios error object
 * @param {object} form - The Ant Design Form instance (from Form.useForm())
 * @param {Function} [defaultErrorCallback] - Optional callback for non-422 errors (like message.error)
 */
export const handleFormErrors = (error, form, defaultErrorCallback) => {
    // Check if it's a 422 Validation Error from Laravel
    if (error?.response?.status === 422 && error?.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        
        // Map Laravel errors { field: ["Error message"] } to Antd format
        const formErrors = Object.keys(apiErrors).map((field) => ({
            name: field,
            errors: apiErrors[field], // apiErrors[field] is already an array of strings
        }));

        // Set the errors in the Ant Design form
        form.setFields(formErrors);
    } else {
        // If it's a 500, 404, or network error, trigger the default callback if provided
        if (defaultErrorCallback) {
            defaultErrorCallback(error?.response?.data?.message || error.message || 'Something went wrong');
        }
    }
};
