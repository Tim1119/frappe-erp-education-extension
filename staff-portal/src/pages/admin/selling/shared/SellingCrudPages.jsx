import ListPage from "../../hr/recruitment/shared/RecruitmentListPage";
import FormPage from "../../hr/recruitment/shared/RecruitmentFormPage";
import ProfilePage from "../../hr/recruitment/shared/RecruitmentProfilePage";
import Form from "../../hr/recruitment/shared/RecruitmentForm";
import { CONFIG } from "./sellingConfig";
export const SellingList = ({ type }) => <ListPage config={CONFIG[type]} />;
export const SellingForm = ({ type }) => <FormPage config={CONFIG[type]} Form={Form} />;
export const SellingProfile = ({ type }) => <ProfilePage config={CONFIG[type]} />;
