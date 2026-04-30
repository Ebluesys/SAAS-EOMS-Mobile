import axios from 'axios';
import constants from './constants';

export async function getApi(url, header) {
  console.log('GetApi: ', `${constants.BASE_URL}/${url}`);

  return await axios.get(`${constants.BASE_URL}/${url}`, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      'Authorization': header.accesstoken,
      // Authorization: `Bearer ${header.accesstoken ?? ''}`,
    },
  });
}

export async function getApiWithParam(url, param, header) {
  console.log('getApiWithParam: ', `${constants.BASE_URL}/${url}`);

  return await axios({
    method: 'GET',
    baseURL: constants.BASE_URL,
    url: url,
    params: param,
    headers: {
      Accept: header.Accept,
      'Content-type': header.contenttype,
    },
  });
}

export async function postApi(url, payload, header) {
  console.log('PostApi: ', `${constants.BASE_URL}/${url}`, payload);

  return await axios.post(`${constants.BASE_URL}/${url}`, payload, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      'Authorization': header.accesstoken,
      // Authorization: `Bearer ${header.accesstoken ?? ''}`,
    },
  });
}


export async function postApiWithParam(url, payload, header) {
  // If payload is a number or string (like an ID), append it to the URL
  let apiUrl = `${constants.BASE_URL}/${url}`;
  let requestPayload = payload;
  
  // Check if payload is a primitive value (number/string) that should be part of URL
  if (typeof payload === 'number' || typeof payload === 'string') {
    apiUrl = `${constants.BASE_URL}/${url}/${payload}`;
    requestPayload = {}; // Empty payload for URL-based requests
  }
  console.log('postApiWithParam: ', apiUrl, requestPayload);
  return await axios.post(apiUrl, requestPayload, {
    headers: {
      Accept: header.Accept,
      'Content-Type': header.contenttype,
      'Authorization': header.accesstoken,
    },
  });
}