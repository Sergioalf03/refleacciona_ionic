export const URI_LOGIN = () => 'login';
export const URI_REGISTER = () => 'register';
export const URI_HOME = () => 'home';
export const URI_RECOVER_ACCOUNT = () => 'recover';
export const URI_SEND_RECOVER_CODE = (withMail: string) => `code/${withMail}`;
export const URI_EMAIL_CONFIRMATION = (withMail: string) => `email-confirmation/${withMail}`;
export const URI_AUDITORY_FORM = (id: string) => `auditory-form/${id}`;
export const URI_AUDITORY_LIST = (origin: string) => `auditory-list/${origin}`;
export const URI_PROFILE = () => 'profile';
export const URI_QUESTION_FORM = (from: string, auditoryId: string, sectionId: string) => `question-form/${from}/${auditoryId}/${sectionId}`;
export const URI_AUDITORY_FINISH_FORM = (from: string, auditoryId: string) => `auditory-finish-form/${from}/${auditoryId}`;
export const URI_AUDITORY_DETAIL = (id: string) => `auditory-detail/${id}`;
export const URI_HELMET_LIST = (type: string) => `helmet-colleaction-list/${type}`;
export const URI_HELMET_COLLECION_DETAIL = (id: string) => `helmet-collection-detail/${id}`;
export const URI_HELMET_COUNT_FORM = (id: string) => `helmet-count-form/${id}`;
