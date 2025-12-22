let handler = null;

export const setLoadingHandler = (h) => {
  handler = h;
};

export const getLoadingHandler = () => handler;
