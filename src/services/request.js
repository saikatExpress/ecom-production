import api from "./api";

/*
|--------------------------------------------------------------------------
| GET Multiple Data
|--------------------------------------------------------------------------
*/
export const getDatas = async (url, params = {}) => {

    const response = await api.get(url, {
        params,
    });

    return response.data;
};

/*
|--------------------------------------------------------------------------
| GET Single Data
|--------------------------------------------------------------------------
*/
export const getData = async (url, params = {}) => {

    const response = await api.get(url, {
        params,
    });

    return response.data;
};

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/
export const postData = async (url, data = {}) => {

    const response = await api.post(url, data);

    return response.data;
};

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/
export const putData = async (url, data = {}) => {

    const response = await api.put(url, data);

    return response.data;
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
export const deleteData = async (url) => {

    const response = await api.delete(url);

    return response.data;
};