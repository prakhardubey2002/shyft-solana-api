import axios from 'axios';

export const Utility = {
  request: async function (uri: string): Promise<any> {
    try {
      const res = await axios.get(uri);
      return res.status === 200 ? res.data : {};
    } catch (error) {
      throw error;
    }
  },
};
