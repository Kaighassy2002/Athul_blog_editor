import { commonAPI } from "./commonApi"
import { SERVER_URL } from "./serverURL"

export const saveEditorBlogAPI= async(payload)=>{
  return  await commonAPI("POST",`${SERVER_URL}/blog/save`,payload)
}

export const saveEditorScribbleAPI= async(payload)=>{
  return  await commonAPI("POST",`${SERVER_URL}/scribble/save`,payload)
}


export const listAllBlogsAPI= async()=>{
  return  await commonAPI("GET",`${SERVER_URL}/list-blog`)
}

 export const listAllScribbleAPI= async()=>{
  return  await commonAPI("GET",`${SERVER_URL}/list-scribble`)
}

export const blogByIdAPI = async (id) => {
  return await commonAPI("GET", `${SERVER_URL}/blog/${id}`);
};

export const scribbleByIdAPI = async (id) => {
  return await commonAPI("GET", `${SERVER_URL}/scribble/${id}`);
};

export const updatesBlogByIdAPI = async (id, data) => {
  return await commonAPI("PUT", `${SERVER_URL}/update-blog/${id}`, data);
};

export const updatesScribbleByIdAPI = async (id, data) => {
  return await commonAPI("PUT", `${SERVER_URL}/update-scribble/${id}`, data);
};

export const characterAPI= async()=>{
  return  await commonAPI("GET",`${SERVER_URL}/character-items`)
}

export const teachStackAPI= async()=>{
  return  await commonAPI("GET",`${SERVER_URL}/tech-items`)
}