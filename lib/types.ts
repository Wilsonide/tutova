export type Role = "PARENT" | "TUTOR" | "LEARNER" | "ADMIN";
export type User = {id:string; email:string; role:Role; status:string; email_verified:boolean; display_name:string; created_at:string};
export type TutorProfile = {id:string;tutor_id:string;headline:string;bio:string;years_experience:number;work_modes:string[];service_area?:string|null;timezone:string;accepts_new_learners:boolean;payout_method_preference:string;is_public:boolean};
export type Offering = {id:string;tutor_id:string;category:string;title:string;description:string;level:string;is_active:boolean};
export type Pricing = {id:string;offering_id:string;tutor_id:string;pricing_model:string;amount_minor:number;currency:string;contract_scope?:string|null;estimated_hours?:number|null;status:string;version:number};
export type TutoringRequest = {id:string;parent_id:string;tutor_id:string;offering_id:string;learner_type:string;learner_display_name?:string;learning_goals:string;preferred_mode:string;status:string;created_at?:string};
export type ApiError = {detail?:string|{msg?:string}[]};
