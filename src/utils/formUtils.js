export const handleFormErrors = (error, form, defaultErrorCallback) => {
    if (error?.response?.status === 422 && error?.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        
        const formErrors = Object.keys(apiErrors).map((field) => ({
            name: field,
            errors: apiErrors[field],
        }));

        form.setFields(formErrors);
    } else {
        if (defaultErrorCallback) {
            defaultErrorCallback(error?.response?.data?.message || error.message || 'Something went wrong');
        }
    }
};
