import { commonAPI } from "./commonApi"
import { SERVER_URL } from "./serverURL"


export const saveEditorAPI= async(payload)=>{
  return  await commonAPI("POST",`${SERVER_URL}/save`,payload)
}


export const listAllBlogsAPI= async()=>{
  return  await commonAPI("GET",`${SERVER_URL}/list`)
}

export const blogByIdAPI = async (id) => {
  return await commonAPI("GET", `${SERVER_URL}/blog/${id}`);
};

export const updatesByIdAPI = async (id, data) => {
  return await commonAPI("PUT", `${SERVER_URL}/update/${id}`, data);
};