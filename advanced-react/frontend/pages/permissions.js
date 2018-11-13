import React from "react";

import Permissions from "../components/Permissions";
import PleaseSignIn from "../components/PleaseSignIn";

const PermissionsPage = () => {
  return (
    <div>
      <PleaseSignIn>
        <Permissions />
      </PleaseSignIn>
    </div>
  );
};

export default PermissionsPage;
