import { useLoading } from "../../utils/LoadingContext";
import "../../styles/GlobalLoading.css";

const GlobalLoading = () => {
  const { loading } = useLoading();
  if (!loading) return null;

  return (
    <div className="global-loading-backdrop">
      <div className="global-loading-spinner" />
    </div>
  );
};

export default GlobalLoading;
