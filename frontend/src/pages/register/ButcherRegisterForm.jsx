import RoleRegistrationForm from './RoleRegistrationForm';

function ButcherRegisterForm(props) {
  return (
    <RoleRegistrationForm
      {...props}
      role="Butcher"
      loginPath="/login/butcher"
      successTitle="Registration submitted"
      successMessage="Your butcher application has been received. It will be reviewed before activation."
    />
  );
}

export default ButcherRegisterForm;
