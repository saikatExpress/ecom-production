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

export const postData = async (url, data = {}) => {

    const response = await api.post(url, data);

    return response.data;
};

export const putData = async (url, data = {}) => {

    const response = await api.put(url, data);

    return response.data;
};

export const patchData = async (url, data = {}) => {
    const response = await api.patch(url, data);

    return response.data;
};

export const deleteData = async (url, data = {}) => {

    const response = await api.delete(url, data);

    return response.data;
};