import Spinner from 'react-bootstrap/Spinner';
import '../styles/loading.css'; 

export default function LoadingBox() {
  return (
    <Spinner animation="border" role="status">
      <span className="loader">Loading...</span>
    </Spinner>
  );
}
