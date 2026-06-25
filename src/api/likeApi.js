import apiClient from './apiClient';
import {ENDPOINTS} from '../utils/constants';

/**
 * Toggles like state for a given reel/post via the tRPC mutation endpoint.
 * tRPC POST procedures expect the input as the raw JSON body.
 *
 * @param {string} postId
 */
export const toggleLike = async postId => {
  const response = await apiClient.post(ENDPOINTS.TOGGLE_LIKE, {postId});
  const payload = response?.data?.result?.data ?? response?.data ?? {};
  return payload;
};

export default toggleLike;
