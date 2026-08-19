import RoleResetPassword from './RoleResetPassword';

function CustomerResetPassword() {
  return <RoleResetPassword role="Customer" loginPath="/login/customer" accountPurpose="customer account" />;
}

export default CustomerResetPassword;
