import RoleForgotPassword from './RoleForgotPassword';

function CustomerForgotPassword() {
  return <RoleForgotPassword role="Customer" loginPath="/login/customer" resetPath="/reset-password/customer" />;
}

export default CustomerForgotPassword;
