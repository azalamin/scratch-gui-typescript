import { useSelector } from 'react-redux';
import Login from '../../components/AuthPages/Login';
import VerificationRequest from '../../components/AuthPages/VerificationRequest';
import { RootState } from '../../store';

const PrivateRoute: React.FC = ({ children }) => {
	const isLoading = useSelector<RootState, boolean>(
		state => state.register.isLoading
	);
	const isAuthenticated = useSelector<RootState, boolean>(
		state => state.register.isAuthenticated
	);
	const isAuthorizedNavigate = useSelector<RootState, boolean>(
		state =>
			isAuthenticated && state.register.user && !state.register.emailVerified
	);
	let finalComponent = !isAuthenticated && !isLoading ? <Login /> : children;
	return isAuthorizedNavigate ? <VerificationRequest /> : <>{finalComponent}</>;
};

export default PrivateRoute;
