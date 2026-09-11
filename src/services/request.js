import api from "./api";

export const getDatas = async (url, params = {}) => {

    const response = await api.get(url, {
        params,
    });

    return response.data;
};

export const getData = async (url, params = {}) => {

    const response = await api.get(url, {
        params,
    });

    return response.data;
};

export const postData = async (url, data = {}, config = {}) => {

    const response = await api.post(url, data, config);

    return response.data;
};

export const putData = async (url, data = {}, config = {}) => {

    const response = await api.put(url, data, config);

    return response.data;
};

export const patchData = async (url, data = {}, config = {}) => {
    const response = await api.patch(url, data, config);

    return response.data;
};

export const deleteData = async (url, data = {}, config = {}) => {

    const response = await api.delete(url, data, config);

    return response.data;
};