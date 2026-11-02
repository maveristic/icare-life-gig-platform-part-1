import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, ChevronRight, ShieldCheck, Briefcase, User, DollarSign,
  CheckSquare, Globe, AlertTriangle, ArrowLeft, Mail, Phone, Lock,
  RefreshCw, Calendar, Upload, FileText, Check, Pencil, Camera, Info,
  CreditCard, ScanLine, Sparkles, Eye, Save, RotateCcw,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import careProviderImg from "@/imports/Care_Provider.png";
import employerImg from "@/imports/Employer_-_Care_Seeker-1.png";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_EMAIL = "khasnobis.in@gmail.com";
const KNOWN_PHONE = "9967011101";
const MOCK_OTP    = "012358";

const COUNTRY_CODES = [
  { code: "+91",  name: "India",     flag: "🇮🇳", supported: true  },
  { code: "+1",   name: "USA",       flag: "🇺🇸", supported: false },
  { code: "+44",  name: "UK",        flag: "🇬🇧", supported: false },
  { code: "+49",  name: "Germany",   flag: "🇩🇪", supported: false },
  { code: "+61",  name: "Australia", flag: "🇦🇺", supported: false },
  { code: "+971", name: "UAE",       flag: "🇦🇪", supported: false },
  { code: "+65",  name: "Singapore", flag: "🇸🇬", supported: false },
];

const PHONE_RULES: Record<string, { digits: number; note: string; pattern: RegExp }> = {
  "+91":  { digits: 10, note: "10 digits, starting with 6–9",     pattern: /^[6-9]\d{9}$/ },
  "+1":   { digits: 10, note: "10-digit NANP number",             pattern: /^\d{10}$/ },
  "+44":  { digits: 10, note: "10 digits (without leading 0)",    pattern: /^\d{10}$/ },
  "+49":  { digits: 11, note: "10–11 digits",                     pattern: /^\d{10,11}$/ },
  "+61":  { digits: 9,  note: "9 digits (without leading 0)",     pattern: /^\d{9}$/ },
  "+971": { digits: 9,  note: "9 digits (e.g. 501234567)",        pattern: /^\d{9}$/ },
  "+65":  { digits: 8,  note: "8 digits, starting with 6, 8 or 9",pattern: /^[689]\d{7}$/ },
};

const CARE_PROVIDER_ROLES = [
  "Caregiver / Home Care Aide","Registered Nurse (RN)","Licensed Practical Nurse (LPN)",
  "Physiotherapist","Occupational Therapist","Speech & Language Therapist",
  "Nutritionist / Dietitian","Palliative Care Specialist","Mental Health Support Worker",
  "Medical Social Worker","Health Technician","Care Concierge (MD)",
];
const EMPLOYER_TYPES = [
  "Individual / Private Care Recipient","Family Care Coordinator","Hospital",
  "Nursing Home / Care Home","Hospice","Rehabilitation Centre","Home Care Agency",
  "Corporate Wellness Provider","NGO / Non-Profit Care Organisation","Government Health Department",
];

const INDIA_NATIONAL_LANGS = ["Hindi","English"];
const INDIA_REGIONAL_LANGS = [
  "Assamese","Bengali","Gujarati","Kannada","Malayalam","Marathi","Nepali","Odia","Punjabi","Tamil","Telugu",
];
const FOREIGN_LANGS = [
  "Arabic","French","German","Spanish","Mandarin Chinese","Japanese","Portuguese","Russian",
  "Italian","Korean","Dutch","Swedish","Turkish","Bahasa Indonesia","Swahili",
  "Persian (Farsi)","Polish","Vietnamese","Thai","Greek",
];

const GENDER_OPTIONS = ["Male","Female","Non-binary","Prefer not to say"];

const EDUCATION_OPTIONS_NEW = [
  "Junior School / Secondary School","High School / Higher Secondary",
  "Bachelor's Degree","Master's / Doctorate",
];
const PROFESSIONAL_QUALS = [
  "MBBS (Bachelor of Medicine & Surgery)","BDS (Bachelor of Dental Surgery)",
  "BAMS (Ayurvedic Medicine & Surgery)","BHMS (Homeopathic Medicine & Surgery)",
  "BPT (Bachelor of Physiotherapy)","MPT (Master of Physiotherapy)",
  "B.Sc Nursing","M.Sc Nursing","GNM (General Nursing & Midwifery)",
  "ANM (Auxiliary Nurse Midwife)","B.Sc Medical Lab Technology",
  "B.Sc Operation Theatre Technology","B.Sc Radiology & Imaging",
  "B.Sc Cardiac Care Technology","Diploma in Nutrition & Dietetics",
  "Diploma in Health Care Management","Certificate in Care Giving",
  "Certificate in Elderly Care","First Aid & CPR Certificate",
  "Palliative Care Certificate","Any Other",
];
const WORK_ENV_OPTIONS = ["Home Health Care","Hospital Care","Hospice","Old Age Home","Others"];

const ADL_ITEMS = ["Bed Mobility","Ambulation","Bathing","Dressing","Toileting","Incontinence","Assisted Feeding","Pressure Relief"];
const IADL_ITEMS = ["Vital Signs","Medication Reminders","Specialised Meals","Housekeeping","Escort","Communication"];
const MEDICAL_LICENSED = ["Wound Care","Catheter Management","IV Therapy","Post-Surgical Care","Physiotherapy Assist","Ventilator Care"];
const NON_MEDICAL_SUPPORT = ["Companion Care","Meal Preparation","Mobility Assist","Hygiene Support","Household Tasks","Errand Support"];
const SPECIALIZED_ITEMS_EXTRA = ["Cognitive Engagement","IoT Monitoring","Infection Control","Emergency Response"];

const SALARY_OPTIONS = [
  { id: "floor"       as const, label: "Floor",       rate: "₹1,050", subtitle: "Base Profile Value",   color: "#6B7280", border: "#D1D5DB", selBorder: "#6B7280" },
  { id: "recommended" as const, label: "Recommended", rate: "₹1,150", subtitle: "Market Average Tier",  color: "#0D6EFD", border: "#BFDBFE", selBorder: "#0D6EFD", featured: true },
  { id: "premium"     as const, label: "Premium",     rate: "₹1,300", subtitle: "Maximum Expert Tier",  color: "#5C0F8B", border: "#E9D5FF", selBorder: "#5C0F8B" },
];
type SalaryTier = "floor" | "recommended" | "premium";

const PIN_DB: Record<string, { locality: string; city: string; state: string }> = {
  "400001": { locality: "Fort",                city: "Mumbai",    state: "Maharashtra" },
  "400050": { locality: "Bandra West",         city: "Mumbai",    state: "Maharashtra" },
  "400051": { locality: "Bandra Kurla Complex",city: "Mumbai",    state: "Maharashtra" },
  "400071": { locality: "Andheri East",        city: "Mumbai",    state: "Maharashtra" },
  "110001": { locality: "Connaught Place",     city: "New Delhi", state: "Delhi" },
  "110016": { locality: "Hauz Khas",           city: "New Delhi", state: "Delhi" },
  "560001": { locality: "Bangalore City",      city: "Bengaluru", state: "Karnataka" },
  "560038": { locality: "Indiranagar",         city: "Bengaluru", state: "Karnataka" },
  "600001": { locality: "Park Town",           city: "Chennai",   state: "Tamil Nadu" },
  "700001": { locality: "B.B.D. Bagh",         city: "Kolkata",   state: "West Bengal" },
  "411001": { locality: "Shivajinagar",        city: "Pune",      state: "Maharashtra" },
  "411007": { locality: "Koregaon Park",       city: "Pune",      state: "Maharashtra" },
  "500001": { locality: "Abids",               city: "Hyderabad", state: "Telangana" },
  "380001": { locality: "Lal Darwaza",         city: "Ahmedabad", state: "Gujarat" },
  "302001": { locality: "Johari Bazaar",       city: "Jaipur",    state: "Rajasthan" },
  "226001": { locality: "Hazratganj",          city: "Lucknow",   state: "Uttar Pradesh" },
  "682001": { locality: "Ernakulam South",     city: "Kochi",     state: "Kerala" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Types / Interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface LangSkills { speak: boolean; read: boolean; write: boolean; }
const BLANK_SKILLS: LangSkills = { speak: false, read: false, write: false };
interface LangEntry { lang: string; skills: LangSkills; }

interface PersonalDetails {
  firstName: string; lastName: string; dob: string; gender: string;
  nationalSkills: Record<string, LangSkills>;
  regionalLangs: LangEntry[];
  foreignLangs: LangEntry[];
}

interface ProfessionalDetails {
  education: string; eduCertFile: string;
  profQuals: string[]; profQualOther: string; profCertFiles: string[];
  vocationalCerts: Array<{ name: string; fileName: string }>;
}

interface CapabilitiesState {
  sectionA: Record<string, boolean>;
  sectionB: Record<string, boolean>;
}

interface VocationalCert { name: string; fileName: string; }

type EmployerKind = "individual" | "agency" | "corporate";

const INDIVIDUAL_ROLES = ["Individual / Private Care Recipient","Family Care Coordinator"];
const AGENCY_ROLES     = ["Home Care Agency","Hospice","Rehabilitation Centre"];

function getEmployerKind(subRole: string): EmployerKind {
  if (INDIVIDUAL_ROLES.includes(subRole)) return "individual";
  if (AGENCY_ROLES.includes(subRole))     return "agency";
  return "corporate";
}

interface EmployerDetails {
  firstName: string; lastName: string; dob: string; gender: string;
  relationship: string; recipientName: string; recipientAge: string; condition: string;
  orgName: string; regNumber: string; contactPerson: string; designation: string;
  addrPin: string; addrStreet: string; addrLocality: string;
  addrCity: string; addrState: string; addrLandmark: string;
  bedCapacity: string; departments: string; contractType: string;
  staffCount: string; operatingHours: string;
  careType: string; budget: string;
}
const BLANK_EMPLOYER: EmployerDetails = {
  firstName:"",lastName:"",dob:"",gender:"",relationship:"",recipientName:"",
  recipientAge:"",condition:"",orgName:"",regNumber:"",contactPerson:"",
  designation:"",addrPin:"",addrStreet:"",addrLocality:"",
  addrCity:"",addrState:"",addrLandmark:"",bedCapacity:"",
  departments:"",contractType:"",staffCount:"",operatingHours:"",careType:"",budget:"",
};

interface EmployerServicesState {
  sectionA: Record<string, boolean>;
  sectionB: Record<string, boolean>;
}

interface AddressValues { pin:string; address:string; locality:string; city:string; state:string; landmark:string; }
const BLANK_ADDRESS: AddressValues = { pin:"",address:"",locality:"",city:"",state:"",landmark:"" };

function addrFromEmployer(d: EmployerDetails): AddressValues {
  return { pin:d.addrPin,address:d.addrStreet,locality:d.addrLocality,city:d.addrCity,state:d.addrState,landmark:d.addrLandmark };
}
function applyAddrToEmployer(d: EmployerDetails, a: AddressValues): EmployerDetails {
  return { ...d,addrPin:a.pin,addrStreet:a.address,addrLocality:a.locality,addrCity:a.city,addrState:a.state,addrLandmark:a.landmark };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

function isKnownUser(email: string, phone: string) {
  return email.trim().toLowerCase() === KNOWN_EMAIL || phone.trim() === KNOWN_PHONE;
}

function validateEmail(email: string): { valid: boolean; error: string } {
  if (!email) return { valid:false,error:"" };
  const parts = email.split("@");
  if (parts.length !== 2) return { valid:false,error:"Must contain exactly one @ symbol." };
  const [local,domain] = parts;
  if (!local) return { valid:false,error:"Email cannot start with @." };
  if (/\s/.test(email)) return { valid:false,error:"No spaces allowed." };
  if (!domain.includes(".")) return { valid:false,error:"Domain must include a dot (e.g. gmail.com)." };
  const domParts = domain.split(".");
  const tld = domParts[domParts.length-1];
  if (tld.length<2||tld.length>6) return { valid:false,error:"Invalid domain extension." };
  if (domParts.some(p=>p==="")) return { valid:false,error:"Domain cannot have consecutive dots." };
  return { valid:true,error:"" };
}

function validatePhone(digits: string, code: string): { valid: boolean; error: string } {
  if (!digits) return { valid:false,error:"" };
  const rule = PHONE_RULES[code];
  if (!rule) return { valid:digits.length>=7,error:digits.length<7?"Enter a valid number.":"" };
  if (!rule.pattern.test(digits)) return { valid:false,error:`${code} requires ${rule.note}.` };
  return { valid:true,error:"" };
}

function calcAge(dob: string): number|null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear()-birth.getFullYear();
  const m = today.getMonth()-birth.getMonth();
  if (m<0||(m===0&&today.getDate()<birth.getDate())) age--;
  return age;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────────────────────

function GradHeader({ title,subtitle,step,total,onBack,pill }: {
  title:string;subtitle?:string;step?:number;total?:number;onBack?:()=>void;pill?:string;
}) {
  return (
    <div className="px-6 pt-7 pb-5 flex-shrink-0" style={{ background:"linear-gradient(155deg,#5C0F8B 0%,#0D6EFD 100%)" }}>
      {onBack && (
        <button onClick={onBack} className="mb-3 flex items-center gap-1.5 text-white/65 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft size={15}/> Back
        </button>
      )}
      {step!=null&&total!=null&&(
        <div className="flex gap-1.5 mb-3">
          {Array.from({length:total}).map((_,i)=>(
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{background:i<step?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)"}}/>
          ))}
        </div>
      )}
      {pill&&<span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
        style={{background:"rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.8)"}}>{pill}</span>}
      <h1 className="text-xl font-black text-white leading-snug">{title}</h1>
      {subtitle&&<p className="text-sm text-white/65 mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{children}</label>;
}

function TextInput({ value,onChange,placeholder,type="text",icon,disabled,accent }: {
  value:string;onChange?:(v:string)=>void;placeholder?:string;type?:string;
  icon?:React.ReactNode;disabled?:boolean;accent?:string;
}) {
  return (
    <div className="relative">
      {icon&&<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
      <input type={type} value={value} placeholder={placeholder} disabled={disabled}
        onChange={e=>onChange?.(e.target.value)}
        className="w-full rounded-2xl py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-500"
        style={{paddingLeft:icon?44:16,paddingRight:16,borderColor:accent??"#E5E7EB",boxShadow:accent?`0 0 0 3px ${accent}18`:"0 1px 3px rgba(0,0,0,0.05)"}}/>
    </div>
  );
}

function ProceedBtn({ label,onClick,disabled,green }: { label:string;onClick:()=>void;disabled?:boolean;green?:boolean }) {
  return (
    <div className="px-6 pb-8 pt-3">
      <button onClick={onClick} disabled={disabled}
        className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200"
        style={{
          background:disabled?"#E5E7EB":green?"linear-gradient(135deg,#198754 0%,#157347 100%)":"linear-gradient(135deg,#5C0F8B 0%,#0D6EFD 100%)",
          color:disabled?"#9CA3AF":"#fff",
          boxShadow:disabled?"none":green?"0 4px 18px rgba(25,135,84,0.30)":"0 4px 18px rgba(13,110,253,0.30)",
          cursor:disabled?"not-allowed":"pointer",
        }}>
        {label} <ChevronRight size={17}/>
      </button>
    </div>
  );
}

function Checkbox({ label,checked,onChange,color="#0D6EFD" }: { label:string;checked:boolean;onChange:(v:boolean)=>void;color?:string }) {
  return (
    <button onClick={()=>onChange(!checked)} className="flex items-center gap-3 w-full py-2.5 rounded-xl px-1 transition-colors active:bg-gray-50 text-left">
      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{borderColor:checked?color:"#D1D5DB",background:checked?color:"transparent"}}>
        {checked&&<Check size={11} color="white" strokeWidth={3}/>}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

function RadioCard({ label,selected,onSelect,color="#0D6EFD" }: { label:string;selected:boolean;onSelect:()=>void;color?:string }) {
  return (
    <button onClick={onSelect}
      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 border-2 transition-all duration-150 active:scale-[0.98] text-left"
      style={{borderColor:selected?color:"#E5E7EB",background:selected?(color==="#0D6EFD"?"#E2F0FF":"#F5F0FF"):"#fff",boxShadow:selected?`0 0 0 3px ${color}18`:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{borderColor:selected?color:"#D1D5DB"}}>
        {selected&&<div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/>}
      </div>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
    </button>
  );
}

function SectionDivider({ label,color="#0D6EFD" }: { label:string;color?:string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="h-px flex-1" style={{background:`${color}30`}}/>
      <span className="text-[10px] font-black uppercase tracking-widest px-2" style={{color}}>{label}</span>
      <div className="h-px flex-1" style={{background:`${color}30`}}/>
    </div>
  );
}

function Stars({ rating }: { rating:number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s=>(
        <svg key={s} width="13" height="13" viewBox="0 0 20 20">
          <polygon points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
            fill={s<=Math.floor(rating)?"#F59E0B":s-0.5<=rating?"#FCD34D":"#E5E7EB"} stroke="none"/>
        </svg>
      ))}
      <span className="text-xs font-black text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AddressPinFields
// ─────────────────────────────────────────────────────────────────────────────

function AddressPinFields({ values,onChange,accentColor="#0D6EFD" }: { values:AddressValues;onChange:(v:AddressValues)=>void;accentColor?:string }) {
  const [pinState,setPinState]=useState<"idle"|"found"|"notfound">("idle");
  function handlePin(raw:string){
    const pin=raw.replace(/\D/g,"").slice(0,6);
    let next:AddressValues={...values,pin};
    if(pin.length===6){const hit=PIN_DB[pin];if(hit){next={...next,locality:hit.locality,city:hit.city,state:hit.state};setPinState("found")}else setPinState("notfound")}
    else setPinState("idle");
    onChange(next);
  }
  const mapQuery=encodeURIComponent([values.address,values.landmark,values.locality,values.city,values.state,values.pin].filter(Boolean).join(", "));
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>PIN / ZIP Code</FieldLabel>
          {pinState==="found"&&<span className="text-[10px] font-black text-green-600 flex items-center gap-1"><Check size={9} strokeWidth={3}/> Auto-filled</span>}
          {pinState==="notfound"&&<span className="text-[10px] font-bold text-amber-500">Fill manually</span>}
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><ScanLine size={16} color={pinState==="found"?"#198754":"#9CA3AF"}/></div>
          <input type="tel" value={values.pin} onChange={e=>handlePin(e.target.value)} placeholder="e.g. 400050" maxLength={6} inputMode="numeric"
            className="w-full rounded-2xl pl-11 pr-16 py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 tracking-widest"
            style={{borderColor:pinState==="found"?"#198754":pinState==="notfound"?"#FCD34D":"#E5E7EB"}}/>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black tabular-nums text-gray-300">{values.pin.length}/6</span>
        </div>
      </div>
      <div><FieldLabel>Street Address / Flat / Building</FieldLabel><TextInput value={values.address} onChange={v=>onChange({...values,address:v})} placeholder="e.g. 12B, Harmony Heights" accent={values.address?accentColor:undefined}/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Locality / Area</FieldLabel><TextInput value={values.locality} onChange={v=>onChange({...values,locality:v})} placeholder="e.g. Bandra West" accent={values.locality?accentColor:undefined}/></div>
        <div><FieldLabel>City</FieldLabel><TextInput value={values.city} onChange={v=>onChange({...values,city:v})} placeholder="e.g. Mumbai" accent={values.city?accentColor:undefined}/></div>
      </div>
      <div><FieldLabel>State</FieldLabel><TextInput value={values.state} onChange={v=>onChange({...values,state:v})} placeholder="e.g. Maharashtra" accent={values.state?accentColor:undefined}/></div>
      <div><FieldLabel>Nearest Landmark</FieldLabel><TextInput value={values.landmark} onChange={v=>onChange({...values,landmark:v})} placeholder="e.g. Near Lilavati Hospital" icon={<Globe size={16} color="#9CA3AF"/>} accent={values.landmark?accentColor:undefined}/></div>
      {(values.city||values.locality)&&(
        <motion.a href={`https://maps.google.com/?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
          initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
          className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border no-underline" style={{background:"#E2F0FF",borderColor:"#BFDBFE",display:"flex"}}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#0D6EFD"}}>
            <Globe size={15} color="white"/>
          </div>
          <div className="flex-1"><p className="text-xs font-black text-blue-700">View on Google Maps</p><p className="text-[10px] text-blue-400 truncate">{[values.locality,values.city,values.state].filter(Boolean).join(", ")}</p></div>
          <ChevronRight size={14} color="#93C5FD"/>
        </motion.a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KYC Upload Section
// ─────────────────────────────────────────────────────────────────────────────

function KycUploadSection() {
  const [idType,setIdType]=useState<"aadhaar"|"passport">("aadhaar");
  const [frontFile,setFrontFile]=useState("");
  const [backFile,setBackFile]=useState("");
  const [selfieFile,setSelfieFile]=useState("");
  const frontRef=useRef<HTMLInputElement>(null);
  const backRef=useRef<HTMLInputElement>(null);
  const selfieRef=useRef<HTMLInputElement>(null);
  function pickFile(ref:React.RefObject<HTMLInputElement|null>,setter:(n:string)=>void){
    const el=ref.current;if(!el)return;
    el.onchange=(e:Event)=>{const f=(e.target as HTMLInputElement).files?.[0];if(f)setter(f.name)};el.click();
  }
  const allUploaded=frontFile&&(idType==="passport"||backFile)&&selfieFile;
  return (
    <div className="rounded-2xl border overflow-hidden" style={{borderColor:"#FDE68A",background:"#FFFBEB"}}>
      <div className="flex p-1 gap-1 border-b" style={{borderColor:"#FDE68A"}}>
        {(["aadhaar","passport"] as const).map(t=>(
          <button key={t} onClick={()=>{setIdType(t);setFrontFile("");setBackFile("")}}
            className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            style={{background:idType===t?"#D97706":"transparent",color:idType===t?"#fff":"#D97706"}}>
            {t==="aadhaar"?<CreditCard size={12}/>:<FileText size={12}/>}
            {t==="aadhaar"?"Aadhaar Card":"Passport"}
          </button>
        ))}
      </div>
      <div className="p-3 space-y-2">
        <input ref={frontRef} type="file" accept="image/*,.pdf" className="hidden"/>
        <input ref={backRef}  type="file" accept="image/*,.pdf" className="hidden"/>
        <input ref={selfieRef} type="file" accept="image/*" className="hidden"/>
        {[
          {label:idType==="aadhaar"?"Aadhaar Front":"Passport Data Page",file:frontFile,ref:frontRef,setter:setFrontFile,icon:<Upload size={14} color="#D97706"/>},
          ...(idType==="aadhaar"?[{label:"Aadhaar Back",file:backFile,ref:backRef,setter:setBackFile,icon:<Upload size={14} color="#D97706"/>}]:[]),
          {label:"Live Selfie with ID",file:selfieFile,ref:selfieRef,setter:setSelfieFile,icon:<Camera size={14} color="#D97706"/>},
        ].map(({label,file,ref,setter,icon})=>(
          <button key={label} onClick={()=>pickFile(ref,setter)}
            className="w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all active:scale-[0.98] text-left"
            style={{borderColor:file?"#198754":"#FCD34D",background:file?"#F0FDF4":"#fff"}}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{background:file?"#198754":"#FEF3C7"}}>
              {file?<Check size={14} color="white" strokeWidth={3}/>:icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
              <p className="text-xs font-semibold truncate" style={{color:file?"#198754":"#9CA3AF"}}>{file||"Upload clear photo or PDF"}</p>
            </div>
          </button>
        ))}
        {allUploaded&&(
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
            className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:"#DCFCE7"}}>
            <ShieldCheck size={14} color="#198754"/>
            <p className="text-xs font-bold text-green-700">KYC documents uploaded — pending verification.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IdentifierChips
// ─────────────────────────────────────────────────────────────────────────────

function IdentifierChips({ email,phone }: { email:string;phone:string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {email&&(
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}>
          <Mail size={11} color="#0D6EFD"/>
          <span className="text-xs font-bold text-blue-700">{email}</span>
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ml-1" style={{background:"rgba(13,110,253,0.12)",color:"#0D6EFD"}}>Verified</span>
        </div>
      )}
      {phone&&(
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border" style={{background:"#DCFCE7",borderColor:"#BBF7D0"}}>
          <Phone size={11} color="#198754"/>
          <span className="text-xs font-bold text-green-700">+91 {phone}</span>
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ml-1" style={{background:"rgba(25,135,84,0.12)",color:"#198754"}}>Verified</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Splash
// ─────────────────────────────────────────────────────────────────────────────

function ScreenSplash({ onDone }: { onDone:()=>void }) {
  useEffect(()=>{const t=setTimeout(onDone,2200);return()=>clearTimeout(t)},[onDone]);
  return (
    <div className="flex flex-col items-center justify-center h-full" style={{background:"#5C0F8B"}}>
      <motion.div initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.55,ease:[0.34,1.56,0.64,1]}} className="mb-8 relative">
        <motion.div animate={{scale:[1,1.08,1],opacity:[0.35,0.18,0.35]}} transition={{duration:2.4,repeat:Infinity,ease:"easeInOut"}}
          className="absolute inset-0 rounded-full" style={{background:"rgba(255,255,255,0.18)",margin:-18}}/>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path d="M60 16 L96 35 L96 72 Q96 88 60 104 Q24 88 24 72 L24 35 Z" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
          <rect x="51" y="38" width="18" height="44" rx="5" fill="white" opacity="0.95"/>
          <rect x="38" y="51" width="44" height="18" rx="5" fill="white" opacity="0.95"/>
          <path d="M42 60 L48 60 L52 52 L56 68 L60 56 L64 64 L68 60 L78 60" stroke="#5C0F8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
        </svg>
      </motion.div>
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.5}} className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">CareConnect</h1>
        <p className="text-sm text-white/55 mt-1.5 tracking-wide font-medium">Most trusted healthcare staffing network.</p>
      </motion.div>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}} className="flex gap-1.5 mt-12">
        {[0,1,2].map(i=>(
          <motion.div key={i} animate={{opacity:[0.3,1,0.3],scale:[0.8,1,0.8]}} transition={{duration:1.1,repeat:Infinity,delay:i*0.22}} className="w-1.5 h-1.5 rounded-full bg-white"/>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Selection
// ─────────────────────────────────────────────────────────────────────────────

function ScreenRoleSelect({ onContinue }: { onContinue:(category:"provider"|"employer",role:string)=>void }) {
  const [selected,setSelected]=useState<"provider"|"employer"|null>(null);
  const [role,setRole]=useState("");
  const isValid=selected!==null&&role!=="";
  return (
    <div className="flex flex-col h-full" style={{background:"#F8F9FA"}}>
      <div className="px-6 pt-8 pb-5 flex-shrink-0" style={{background:"linear-gradient(160deg,#5C0F8B 0%,#0D6EFD 100%)"}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.15)"}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="8.5" y="2" width="3" height="16" rx="1.5" fill="white"/><rect x="2" y="8.5" width="16" height="3" rx="1.5" fill="white"/></svg>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-white/55">CareConnect</p>
            <h1 className="text-lg font-black text-white">Who are you?</h1>
          </div>
        </div>
        <p className="text-sm text-white/65">Select your category to personalise your experience.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Care Provider */}
          <button onClick={()=>{setSelected("provider");setRole("")}}
            className="rounded-2xl p-4 flex flex-col items-center gap-3 border-2 transition-all duration-200 active:scale-[0.97] relative"
            style={{borderColor:selected==="provider"?"#0D6EFD":"#E5E7EB",background:selected==="provider"?"#E2F0FF":"#fff",boxShadow:selected==="provider"?"0 0 0 4px rgba(13,110,253,0.12)":"0 1px 4px rgba(0,0,0,0.06)"}}>
            {selected==="provider"&&<div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#0D6EFD"}}><Check size={10} color="white" strokeWidth={3}/></div>}
            <div className="flex items-center justify-center" style={{width:72,height:72}}>
              <ImageWithFallback src={careProviderImg} alt="Care Provider" style={{width:72,height:72,objectFit:"contain",display:"block"}}/>
            </div>
            <div className="text-center">
              <p className="font-black text-sm leading-tight" style={{color:selected==="provider"?"#0D6EFD":"#374151"}}>Care Provider</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Nurses, Caregivers,<br/>Therapists…</p>
            </div>
          </button>
          {/* Employer */}
          <button onClick={()=>{setSelected("employer");setRole("")}}
            className="rounded-2xl p-4 flex flex-col items-center gap-3 border-2 transition-all duration-200 active:scale-[0.97] relative"
            style={{borderColor:selected==="employer"?"#5C0F8B":"#E5E7EB",background:selected==="employer"?"#F5F0FF":"#fff",boxShadow:selected==="employer"?"0 0 0 4px rgba(92,15,139,0.10)":"0 1px 4px rgba(0,0,0,0.06)"}}>
            {selected==="employer"&&<div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#5C0F8B"}}><Check size={10} color="white" strokeWidth={3}/></div>}
            <div className="flex items-center justify-center" style={{width:72,height:72}}>
              <ImageWithFallback src={employerImg} alt="Employer / Care Seeker" style={{width:72,height:72,objectFit:"contain",display:"block"}}/>
            </div>
            <div className="text-center">
              <p className="font-black text-sm leading-tight" style={{color:selected==="employer"?"#5C0F8B":"#374151"}}>Employer /<br/>Care Seeker</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Hospitals, Homes,<br/>Individuals…</p>
            </div>
          </button>
        </div>
        <AnimatePresence>
          {selected!==null&&(
            <motion.div initial={{opacity:0,y:-10,height:0}} animate={{opacity:1,y:0,height:"auto"}} exit={{opacity:0,y:-10,height:0}} transition={{duration:0.28,ease:"easeOut"}} className="overflow-hidden">
              <div className="rounded-2xl p-4 border" style={{background:selected==="provider"?"#E2F0FF":"#F5F0FF",borderColor:selected==="provider"?"#BFDBFE":"#DDD6FE"}}>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{color:selected==="provider"?"#0D6EFD":"#5C0F8B"}}>
                  {selected==="provider"?"Select Your Profession":"Select Your Organisation Type"}
                </label>
                <div className="relative">
                  <select value={role} onChange={e=>setRole(e.target.value)}
                    className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm font-medium bg-white text-gray-800 focus:outline-none transition-all border"
                    style={{borderColor:selected==="provider"?"#BFDBFE":"#DDD6FE"}}>
                    <option value="">Choose…</option>
                    {(selected==="provider"?CARE_PROVIDER_ROLES:EMPLOYER_TYPES).map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" color={selected==="provider"?"#93C5FD":"#C4B5FD"}/>
                </div>
                {role&&(
                  <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} transition={{duration:0.18}}
                    className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl" style={{background:selected==="provider"?"#DBEAFE":"#EDE9FE"}}>
                    <Check size={12} color={selected==="provider"?"#0D6EFD":"#5C0F8B"} strokeWidth={3}/>
                    <p className="text-xs font-bold" style={{color:selected==="provider"?"#1D4ED8":"#5C0F8B"}}>{role}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!selected&&(
          <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#F3F4F6",borderColor:"#E5E7EB"}}>
            <Info size={14} color="#9CA3AF" className="flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-gray-400 leading-relaxed">Your selection personalises your onboarding flow.</p>
          </div>
        )}
      </div>
      <div className="px-6 pb-8 pt-3 flex-shrink-0">
        <button onClick={()=>isValid&&onContinue(selected!,role)} disabled={!isValid}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{background:isValid?selected==="provider"?"linear-gradient(135deg,#5C0F8B,#0D6EFD)":"linear-gradient(135deg,#5C0F8B,#8B2FC9)":"#E5E7EB",color:isValid?"#fff":"#9CA3AF",boxShadow:isValid?"0 4px 20px rgba(92,15,139,0.30)":"none",cursor:isValid?"pointer":"not-allowed"}}>
          <ChevronRight size={18}/> Continue to Registration
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth — Country Dropdown
// ─────────────────────────────────────────────────────────────────────────────

type LoginMethod="phone"|"email";

function CountryDropdown({ selected,setSelected,open,setOpen,error }: {
  selected:typeof COUNTRY_CODES[0];setSelected:(c:typeof COUNTRY_CODES[0])=>void;
  open:boolean;setOpen:(v:boolean)=>void;error:boolean;
}) {
  return (
    <div className="relative flex-shrink-0">
      <button onClick={()=>setOpen(!open)}
        className="flex items-center gap-1.5 rounded-2xl px-3 py-4 border-2 bg-white transition-all"
        style={{borderColor:error?"#EF4444":open?"#0D6EFD":"#E5E7EB",minWidth:104,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="text-sm font-bold text-gray-700">{selected.code}</span>
        <ChevronDown size={12} color="#9CA3AF" className={`transition-transform ${open?"rotate-180":""}`}/>
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:-6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-6,scale:0.97}} transition={{duration:0.14}}
            className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{minWidth:190}}>
            {COUNTRY_CODES.map(c=>(
              <button key={c.code} onClick={()=>{setSelected(c);setOpen(false)}}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <span className="text-lg">{c.flag}</span>
                <span className="text-sm font-semibold text-gray-700 flex-1">{c.name}</span>
                <span className="text-xs font-bold text-gray-400">{c.code}</span>
                {!c.supported&&<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{background:"#FEE2E2",color:"#EF4444"}}>N/A</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Canvas
// ─────────────────────────────────────────────────────────────────────────────

function LoginCanvas({ onLogin }: { onLogin:()=>void }) {
  const [method,setMethod]=useState<LoginMethod>("phone");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");
  const [otpSent,setOtpSent]=useState(false);
  const [otpDigits,setOtpDigits]=useState(["","","","","",""]);
  const [otpError,setOtpError]=useState(false);
  const [countdown,setCountdown]=useState(0);
  const otpRefs=useRef<(HTMLInputElement|null)[]>([]);
  const known=phone.trim()===KNOWN_PHONE||email.trim().toLowerCase()===KNOWN_EMAIL;
  const identifier=method==="phone"?phone:email;
  const touched=identifier.length>3;
  useEffect(()=>{if(countdown<=0)return;const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t)},[countdown]);
  function sendOtp(){if(!known)return;setOtpSent(true);setOtpDigits(["","","","","",""]);setOtpError(false);setCountdown(30);setTimeout(()=>otpRefs.current[0]?.focus(),100)}
  function handleOtpChange(idx:number,val:string){const c=val.replace(/\D/g,"").slice(-1);const next=[...otpDigits];next[idx]=c;setOtpDigits(next);setOtpError(false);if(c&&idx<5)otpRefs.current[idx+1]?.focus()}
  function handleOtpKey(idx:number,e:KeyboardEvent<HTMLInputElement>){if(e.key==="Backspace"&&!otpDigits[idx]&&idx>0)otpRefs.current[idx-1]?.focus()}
  function handleOtpPaste(e:ClipboardEvent<HTMLInputElement>){e.preventDefault();const t=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);const next=["","","","","",""];t.split("").forEach((ch,i)=>{next[i]=ch});setOtpDigits(next);otpRefs.current[Math.min(t.length,5)]?.focus()}
  const enteredOtp=otpDigits.join("");const otpComplete=enteredOtp.length===6;
  function handleVerify(){if(!otpComplete)return;if(enteredOtp===MOCK_OTP)onLogin();else setOtpError(true)}
  const idBorder=known?"#198754":touched?"#EF4444":"#E5E7EB";
  return (
    <motion.div key="login-canvas" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:0.27,ease:[0.25,0.46,0.45,0.94]}}
      className="flex flex-col gap-4 px-6 py-5 flex-1 overflow-y-auto">
      <div className="flex rounded-2xl p-1 gap-1" style={{background:"#F3F4F6"}}>
        {(["phone","email"] as LoginMethod[]).map(m=>(
          <button key={m} onClick={()=>{setMethod(m);setOtpSent(false);setOtpDigits(["","","","","",""]);setOtpError(false)}}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{background:method===m?"#fff":"transparent",color:method===m?"#0D6EFD":"#9CA3AF",boxShadow:method===m?"0 2px 8px rgba(0,0,0,0.10)":"none"}}>
            {m==="phone"?<Phone size={13}/>:<Mail size={13}/>}
            {m==="phone"?"Phone OTP":"Email OTP"}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {known&&!otpSent?<motion.div key="found" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#DCFCE7",borderColor:"#BBF7D0"}}><ShieldCheck size={14} color="#198754" className="flex-shrink-0"/><p className="text-xs font-bold text-green-700">Account found — tap Send OTP.</p></motion.div>
        :!known&&touched&&!otpSent?<motion.div key="nf" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#FEF2F2",borderColor:"#FECACA"}}><AlertTriangle size={13} color="#EF4444" className="flex-shrink-0"/><p className="text-xs font-bold text-red-600">No account found. Try Sign Up.</p></motion.div>
        :otpSent&&!otpError?<motion.div key="sent" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}><Lock size={13} color="#0D6EFD" className="flex-shrink-0"/><p className="text-xs font-bold text-blue-700">OTP sent to your {method==="phone"?"mobile":"email"}.</p></motion.div>
        :otpError?<motion.div key="err" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#FEF2F2",borderColor:"#FECACA"}}><AlertTriangle size={13} color="#EF4444" className="flex-shrink-0"/><p className="text-xs font-bold text-red-600">Incorrect OTP. Try again.</p></motion.div>
        :<motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#F3F4F6",borderColor:"#E5E7EB"}}><Lock size={13} color="#9CA3AF" className="flex-shrink-0"/><p className="text-xs font-medium text-gray-400">Enter your registered {method==="phone"?"mobile":"email"}.</p></motion.div>}
      </AnimatePresence>
      <div>
        <FieldLabel>{method==="phone"?"Mobile Number":"Email Address"}</FieldLabel>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">{method==="phone"?<Phone size={16} color={known?"#198754":"#9CA3AF"}/>:<Mail size={16} color={known?"#198754":"#9CA3AF"}/>}</div>
          {method==="phone"
            ?<input type="tel" value={phone} onChange={e=>{setPhone(e.target.value.replace(/\D/g,""));setOtpSent(false)}} placeholder="9967011101" maxLength={12} disabled={otpSent} className="w-full rounded-2xl pl-11 pr-10 py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50" style={{borderColor:otpSent?"#E5E7EB":idBorder}}/>
            :<input type="email" value={email} onChange={e=>{setEmail(e.target.value);setOtpSent(false)}} placeholder="khasnobis.in@gmail.com" disabled={otpSent} className="w-full rounded-2xl pl-11 pr-10 py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 disabled:bg-gray-50" style={{borderColor:otpSent?"#E5E7EB":idBorder}}/>}
          {known&&!otpSent&&<div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#198754"}}><Check size={10} color="white" strokeWidth={3}/></div>}
          {otpSent&&<button onClick={()=>{setOtpSent(false);setOtpDigits(["","","","","",""]);setOtpError(false)}} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-500">Edit</button>}
        </div>
      </div>
      <AnimatePresence>
        {!otpSent&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.22}} className="overflow-hidden">
          <button onClick={sendOtp} disabled={!known} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{background:known?"linear-gradient(135deg,#5C0F8B 0%,#0D6EFD 100%)":"#E5E7EB",color:known?"#fff":"#9CA3AF",boxShadow:known?"0 4px 16px rgba(13,110,253,0.28)":"none",cursor:known?"pointer":"not-allowed"}}>
            <RefreshCw size={14}/> Send OTP
          </button>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {otpSent&&<motion.div initial={{opacity:0,y:10,height:0}} animate={{opacity:1,y:0,height:"auto"}} exit={{opacity:0,y:10,height:0}} transition={{duration:0.28,ease:"easeOut"}} className="overflow-hidden space-y-4">
          <div>
            <FieldLabel>Enter 6-Digit OTP</FieldLabel>
            <div className="flex gap-2 justify-between">
              {otpDigits.map((d,i)=>(
                <input key={i} ref={el=>{otpRefs.current[i]=el}} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)} onPaste={handleOtpPaste}
                  className="text-center text-lg font-black rounded-2xl border-2 focus:outline-none transition-all"
                  style={{width:44,height:52,borderColor:otpError?"#EF4444":d?"#0D6EFD":"#E5E7EB",background:otpError?"#FEF2F2":d?"#E2F0FF":"#fff",color:otpError?"#EF4444":"#0D1B2A"}}/>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{"Didn't receive it?"}</p>
            <button onClick={()=>countdown===0&&sendOtp()} disabled={countdown>0} className="text-xs font-bold flex items-center gap-1 transition-colors" style={{color:countdown>0?"#9CA3AF":"#0D6EFD"}}>
              <RefreshCw size={11}/>{countdown>0?`Resend in ${countdown}s`:"Resend OTP"}
            </button>
          </div>
          <button onClick={handleVerify} disabled={!otpComplete} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{background:otpComplete?"linear-gradient(135deg,#198754 0%,#0D6EFD 100%)":"#E5E7EB",color:otpComplete?"#fff":"#9CA3AF",boxShadow:otpComplete?"0 4px 20px rgba(25,135,84,0.28)":"none",cursor:otpComplete?"pointer":"not-allowed"}}>
            <ShieldCheck size={17}/> Verify & Log In
          </button>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign Up Canvas
// ─────────────────────────────────────────────────────────────────────────────

function SignUpCanvas({ onSignUp,onBack }: { onSignUp:(email:string,phone:string)=>void;onBack:()=>void }) {
  const [email,setEmail]=useState("");
  const [mobile,setMobile]=useState("");
  const [emailTouched,setEmailTouched]=useState(false);
  const [mobileTouched,setMobileTouched]=useState(false);
  const [selectedCountry,setSelectedCountry]=useState(COUNTRY_CODES[0]);
  const [showDropdown,setShowDropdown]=useState(false);
  const isUnsupported=!selectedCountry.supported;
  const emailResult=validateEmail(email);
  const phoneResult=validatePhone(mobile,selectedCountry.code);
  const emailValid=emailResult.valid;
  const mobileValid=phoneResult.valid&&selectedCountry.supported;
  const known=isKnownUser(email,mobile);
  const bothFilled=emailValid&&mobileValid;
  const isValid=!known&&bothFilled;
  const emailDone=emailValid;
  const mobileDone=mobileValid;
  const rule=PHONE_RULES[selectedCountry.code];
  return (
    <motion.div key="signup-canvas" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:0.27,ease:[0.25,0.46,0.45,0.94]}} className="flex flex-col gap-4 px-6 py-5 flex-1">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-blue-500 transition-colors self-start -mb-1"><ArrowLeft size={15}/> Back to Log In</button>
      <AnimatePresence mode="wait">
        {known?<motion.div key="existing" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#FFFBEB",borderColor:"#FDE68A"}}><AlertTriangle size={13} color="#D97706" className="flex-shrink-0"/><p className="text-xs font-bold text-amber-700">This account exists — please use Log In.</p></motion.div>
        :bothFilled?<motion.div key="ready" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#DCFCE7",borderColor:"#BBF7D0"}}><ShieldCheck size={13} color="#198754" className="flex-shrink-0"/><p className="text-xs font-bold text-green-700">Both fields verified — tap Proceed.</p></motion.div>
        :(emailDone||mobileDone)?<motion.div key="partial" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}><User size={13} color="#0D6EFD" className="flex-shrink-0"/><p className="text-xs font-bold text-blue-700">{!emailDone?"Add your email address.":"Add your mobile number."}</p></motion.div>
        :<div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#F3F4F6",borderColor:"#E5E7EB"}}><User size={13} color="#9CA3AF" className="flex-shrink-0"/><p className="text-xs font-medium text-gray-400">Both email and mobile are required.</p></div>}
      </AnimatePresence>
      <div>
        <FieldLabel>Email Address</FieldLabel>
        <TextInput value={email} onChange={v=>{setEmail(v);setEmailTouched(true)}} placeholder="you@example.com" type="email" icon={<Mail size={16} color={emailValid?"#198754":"#9CA3AF"}/>}
          accent={emailTouched&&email&&!emailValid?"#EF4444":emailValid?"#198754":undefined}/>
        <AnimatePresence>
          {emailTouched&&email&&!emailValid&&emailResult.error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.16}} className="overflow-hidden"><div className="flex items-center gap-1.5 mt-1.5 px-1"><AlertTriangle size={11} color="#EF4444" className="flex-shrink-0"/><p className="text-xs font-semibold text-red-500">{emailResult.error}</p></div></motion.div>}
          {emailValid&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.16}} className="overflow-hidden"><div className="flex items-center gap-1.5 mt-1.5 px-1"><Check size={11} color="#198754" className="flex-shrink-0"/><p className="text-xs font-semibold text-green-600">Valid email address.</p></div></motion.div>}
        </AnimatePresence>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Mobile Number</FieldLabel>
          {rule&&<span className="text-[10px] font-bold text-gray-400">{selectedCountry.code} · {rule.digits} digits required</span>}
        </div>
        <div className="flex gap-2">
          <CountryDropdown selected={selectedCountry} setSelected={c=>{setSelectedCountry(c);setMobileTouched(false);setMobile("")}} open={showDropdown} setOpen={setShowDropdown} error={isUnsupported}/>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><Phone size={16} color={mobileValid?"#198754":"#9CA3AF"}/></div>
              <input type="tel" value={mobile} onChange={e=>{setMobile(e.target.value.replace(/\D/g,""));setMobileTouched(true)}} placeholder={rule?"0".repeat(rule.digits):"Enter number"} maxLength={(rule?.digits??12)+1}
                className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all placeholder:text-gray-300 tracking-wider"
                style={{borderColor:isUnsupported?"#EF4444":mobileTouched&&mobile&&!mobileValid?"#EF4444":mobileValid?"#198754":"#E5E7EB"}}/>
              {mobile.length>0&&rule&&!mobileValid&&<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black tabular-nums" style={{color:mobile.length>rule.digits?"#EF4444":"#9CA3AF"}}>{mobile.length}/{rule.digits}</span>}
              {mobileValid&&<div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#198754"}}><Check size={10} color="white" strokeWidth={3}/></div>}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isUnsupported?<motion.div key="unsupported" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.16}} className="overflow-hidden"><div className="flex items-center gap-1.5 mt-1.5 px-1"><AlertTriangle size={11} color="#EF4444" className="flex-shrink-0"/><p className="text-xs font-semibold text-red-500">The app is not available in your country.</p></div></motion.div>
          :mobileTouched&&mobile&&!mobileValid&&phoneResult.error?<motion.div key="phoneerr" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.16}} className="overflow-hidden"><div className="flex items-center gap-1.5 mt-1.5 px-1"><AlertTriangle size={11} color="#EF4444" className="flex-shrink-0"/><p className="text-xs font-semibold text-red-500">{phoneResult.error}</p></div></motion.div>
          :mobileValid?<motion.div key="phoneok" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.16}} className="overflow-hidden"><div className="flex items-center gap-1.5 mt-1.5 px-1"><Check size={11} color="#198754" className="flex-shrink-0"/><p className="text-xs font-semibold text-green-600">Valid {selectedCountry.name} mobile number.</p></div></motion.div>:null}
        </AnimatePresence>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed text-center px-2">By proceeding, you agree to our <span className="text-blue-500 font-semibold">Terms of Service</span> and <span className="text-blue-500 font-semibold">Privacy Policy</span>.</p>
      <button onClick={()=>onSignUp(email,mobile)} disabled={!isValid} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{background:isValid?"linear-gradient(135deg,#5C0F8B 0%,#0D6EFD 100%)":"#E5E7EB",color:isValid?"#fff":"#9CA3AF",boxShadow:isValid?"0 4px 18px rgba(13,110,253,0.28)":"none",cursor:isValid?"pointer":"not-allowed"}}>
        <ChevronRight size={17}/> Proceed
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Gate
// ─────────────────────────────────────────────────────────────────────────────

function ScreenAuth({ onSignUp,onLogin,onBack }: { onSignUp:(email:string,phone:string)=>void;onLogin:()=>void;onBack:()=>void }) {
  const [tab,setTab]=useState<"login"|"signup">("signup");
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-5 flex-shrink-0" style={{background:"linear-gradient(160deg,#5C0F8B 0%,#0D6EFD 100%)"}}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold mb-3 transition-colors"><ArrowLeft size={15}/> Back</button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.15)"}}><ShieldCheck size={22} color="white"/></div>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-white/55">CareConnect</p>
            <h1 className="text-lg font-black text-white">{tab==="login"?"Welcome Back":"Create Account"}</h1>
          </div>
        </div>
        <p className="text-sm text-white/65 leading-relaxed">{tab==="login"?"Log in to access your verified care profile.":"Most trusted healthcare staffing network."}</p>
        <div className="flex mt-4 rounded-2xl p-1 gap-1" style={{background:"rgba(0,0,0,0.25)"}}>
          {(["signup","login"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{background:tab===t?"#fff":"transparent",color:tab===t?"#5C0F8B":"rgba(255,255,255,0.45)",boxShadow:tab===t?"0 2px 10px rgba(0,0,0,0.18)":"none",transform:tab===t?"scale(1)":"scale(0.97)"}}>
              {t==="signup"?"Sign Up":"Log In"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {tab==="login"?<LoginCanvas key="login" onLogin={onLogin}/>:<SignUpCanvas key="signup" onSignUp={onSignUp} onBack={()=>setTab("login")}/>}
        </AnimatePresence>
      </div>
      <div className="px-6 pb-5 text-center">
        <p className="text-xs text-gray-400">
          {tab==="signup"?<>Already have an account?{" "}<button onClick={()=>setTab("login")} className="text-blue-500 font-semibold">Log In</button></>:<>New here?{" "}<button onClick={()=>setTab("signup")} className="text-blue-500 font-semibold">Create Account</button></>}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP Screen
// ─────────────────────────────────────────────────────────────────────────────

function ScreenOTP({ signupEmail,signupPhone,onNext,onBack }: { signupEmail:string;signupPhone:string;onNext:()=>void;onBack:()=>void }) {
  const [digits,setDigits]=useState(["","","","","",""]);
  const [otpError,setOtpError]=useState(false);
  const [countdown,setCountdown]=useState(30);
  const refs=useRef<(HTMLInputElement|null)[]>([]);
  useEffect(()=>{refs.current[0]?.focus()},[]);
  useEffect(()=>{if(countdown<=0)return;const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t)},[countdown]);
  function handleChange(idx:number,val:string){const c=val.replace(/\D/g,"").slice(-1);const next=[...digits];next[idx]=c;setDigits(next);setOtpError(false);if(c&&idx<5)refs.current[idx+1]?.focus()}
  function handleKey(idx:number,e:KeyboardEvent<HTMLInputElement>){if(e.key==="Backspace"&&!digits[idx]&&idx>0)refs.current[idx-1]?.focus()}
  function handlePaste(e:ClipboardEvent<HTMLInputElement>){e.preventDefault();const t=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);const next=["","","","","",""];t.split("").forEach((ch,i)=>{next[i]=ch});setDigits(next);refs.current[Math.min(t.length,5)]?.focus()}
  const entered=digits.join("");const complete=entered.length===6;
  function handleVerify(){if(!complete)return;if(entered===MOCK_OTP)onNext();else setOtpError(true)}
  const via=signupEmail||(signupPhone?`+91 ${signupPhone}`:"");
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Verification Code" subtitle={`OTP sent to ${via}`} onBack={onBack} step={1} total={5} pill="Step 1 of 5"/>
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center gap-5">
        <div className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}>
          {signupPhone?<Phone size={15} color="#0D6EFD"/>:<Mail size={15} color="#0D6EFD"/>}
          <div><p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Sending OTP to</p><p className="text-sm font-bold text-blue-800">{via}</p></div>
        </div>
        <div className="w-full">
          <FieldLabel>Enter 6-Digit Code</FieldLabel>
          <div className="flex gap-2.5 justify-center mt-2">
            {digits.map((d,i)=>(
              <input key={i} ref={el=>{refs.current[i]=el}} type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKey(i,e)} onPaste={handlePaste}
                className="text-center text-xl font-black rounded-2xl border-2 focus:outline-none transition-all"
                style={{width:46,height:56,borderColor:otpError?"#EF4444":d?"#0D6EFD":"#E5E7EB",background:otpError?"#FEF2F2":d?"#E2F0FF":"#fff",color:otpError?"#EF4444":"#0D1B2A"}}/>
            ))}
          </div>
          {otpError&&<p className="text-xs font-bold text-red-500 text-center mt-2">Incorrect OTP — try again.</p>}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs text-gray-400">{"Didn't receive the code?"}</p>
          <button onClick={()=>{if(countdown===0){setCountdown(30);setDigits(["","","","","",""]);setOtpError(false)}}} disabled={countdown>0} className="text-xs font-bold flex items-center gap-1.5 transition-colors" style={{color:countdown>0?"#9CA3AF":"#0D6EFD"}}>
            <RefreshCw size={11}/>{countdown>0?`Resend in ${countdown}s`:"Resend OTP"}
          </button>
        </div>
        <div className="w-full rounded-2xl p-4 border" style={{background:"#F0FDF4",borderColor:"#BBF7D0"}}>
          <p className="text-xs font-semibold text-green-700 text-center leading-relaxed">🔒 Your OTP is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
      </div>
      <ProceedBtn label="Verify & Continue" onClick={handleVerify} disabled={!complete}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CV Upload / Gemini OCR
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_MOCK_FIELDS = [
  { key:"Full Name",value:"Arnab Khasnobis",conf:98 },{ key:"Date of Birth",value:"15 March 1985",conf:95 },
  { key:"Gender",value:"Male",conf:90 },{ key:"Location",value:"Bandra West, Mumbai, Maharashtra",conf:97 },
  { key:"Education",value:"B.Sc Nursing, Mumbai University",conf:93 },{ key:"Experience",value:"6 years — Palliative & Home Care",conf:91 },
  { key:"Languages",value:"English, Hindi, Bengali",conf:96 },{ key:"Qualification",value:"GNM · First Aid & CPR Certificate",conf:88 },
  { key:"Specialisation",value:"Elderly Care, Post-Surgical Care",conf:85 },{ key:"Suggested Daily Rate",value:"₹1,150 / day",conf:82 },
];
type OCRPhase="idle"|"uploading"|"processing"|"done";

function ScreenCVUpload({ onApply,onSkip,onBack }: { onApply:()=>void;onSkip:()=>void;onBack:()=>void }) {
  const [file,setFile]=useState<{name:string;size:string}|null>(null);
  const [phase,setPhase]=useState<OCRPhase>("idle");
  const [progress,setProgress]=useState(0);
  const [visibleFields,setVisibleFields]=useState(0);
  const fileRef=useRef<HTMLInputElement>(null);
  function handleFile(e:React.ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0];if(!f)return;
    const kb=Math.round(f.size/1024);setFile({name:f.name,size:kb>1024?`${(kb/1024).toFixed(1)} MB`:`${kb} KB`});setPhase("uploading");
    let p=0;const tick=setInterval(()=>{p+=Math.random()*18+6;if(p>=100){p=100;clearInterval(tick);setProgress(100);setTimeout(()=>{setPhase("processing");let revealed=0;const reveal=setInterval(()=>{revealed++;setVisibleFields(revealed);if(revealed>=GEMINI_MOCK_FIELDS.length){clearInterval(reveal);setPhase("done")}},220)},600)}setProgress(Math.min(Math.round(p),100))},80);
  }
  function ConfBar({conf}:{conf:number}){const color=conf>=90?"#198754":conf>=80?"#D97706":"#EF4444";return(<div className="flex items-center gap-1.5 flex-shrink-0"><div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{width:`${conf}%`,background:color}}/></div><span className="text-[10px] font-black tabular-nums" style={{color}}>{conf}%</span></div>)}
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Upload Your CV" subtitle="Gemini AI will auto-fill your profile fields" pill="AI Profile Builder" onBack={onBack} step={2} total={5}/>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{background:"linear-gradient(135deg,#5C0F8B18,#0D6EFD18)",borderColor:"#BFDBFE"}}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)"}}><Sparkles size={18} color="white"/></div>
          <div><p className="text-xs font-black text-gray-800">Powered by Gemini AI + OCR</p><p className="text-[11px] text-gray-500 leading-tight mt-0.5">Reads PDF, DOCX, JPG · Extracts profile fields automatically</p></div>
        </div>
        {phase==="idle"&&(
          <button onClick={()=>fileRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-all active:scale-[0.98]" style={{borderColor:"#BFDBFE",background:"#F8FBFF"}}>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" className="hidden" onChange={handleFile}/>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)"}}><Upload size={28} color="white"/></div>
            <div className="text-center"><p className="font-black text-gray-700 text-sm">Tap to Upload CV / Resume</p><p className="text-xs text-gray-400 mt-1">PDF · DOCX · JPG · PNG — max 10 MB</p></div>
          </button>
        )}
        {(phase==="uploading"||(phase!=="idle"&&file))&&(
          <div className="rounded-2xl border p-4 space-y-3" style={{borderColor:"#E5E7EB",background:"#fff"}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:phase==="done"?"#DCFCE7":"#E2F0FF"}}>{phase==="done"?<Check size={18} color="#198754" strokeWidth={3}/>:<FileText size={18} color="#0D6EFD"/>}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{file?.name}</p><p className="text-xs text-gray-400">{file?.size}</p></div>
            </div>
            {phase==="uploading"&&<div><div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-blue-500">Uploading…</span><span className="text-[10px] font-black text-blue-500">{progress}%</span></div><div className="w-full h-1.5 rounded-full bg-gray-100"><motion.div className="h-full rounded-full" style={{background:"linear-gradient(90deg,#5C0F8B,#0D6EFD)"}} animate={{width:`${progress}%`}} transition={{duration:0.15}}/></div></div>}
            {(phase==="processing"||phase==="done")&&<div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:phase==="done"?"#DCFCE7":"#E2F0FF"}}>{phase==="done"?<><Check size={13} color="#198754" strokeWidth={3}/><span className="text-xs font-bold text-green-700">Extraction complete — {GEMINI_MOCK_FIELDS.length} fields detected</span></>:<><motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:"linear"}}><RefreshCw size={13} color="#0D6EFD"/></motion.div><span className="text-xs font-bold text-blue-600">Gemini OCR analysing document…</span></>}</div>}
          </div>
        )}
        {visibleFields>0&&(
          <div className="space-y-2">
            <div className="flex items-center gap-2"><Sparkles size={13} color="#5C0F8B"/><p className="text-[10px] font-black uppercase tracking-widest text-purple-600">Extracted Fields</p><span className="text-[10px] font-bold text-gray-400 ml-auto">Confidence</span></div>
            {GEMINI_MOCK_FIELDS.slice(0,visibleFields).map(({key,value,conf},i)=>(
              <motion.div key={key} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.04,duration:0.2}}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 border" style={{borderColor:"#F3F4F6",background:"#fff"}}>
                <div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{key}</p><p className="text-sm font-bold text-gray-800 truncate">{value}</p></div>
                <ConfBar conf={conf}/>
              </motion.div>
            ))}
          </div>
        )}
        {phase==="done"&&<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="rounded-2xl px-4 py-3 border flex items-start gap-2" style={{background:"#F5F0FF",borderColor:"#DDD6FE"}}><Info size={14} color="#5C0F8B" className="flex-shrink-0 mt-0.5"/><p className="text-xs font-semibold text-purple-700 leading-relaxed">These fields will be pre-filled in your profile wizard. You can review and edit each one before saving.</p></motion.div>}
      </div>
      <div className="px-6 pb-8 pt-3 space-y-2 flex-shrink-0">
        {phase==="done"?<button onClick={onApply} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)",color:"#fff",boxShadow:"0 4px 20px rgba(92,15,139,0.28)"}}><Sparkles size={17}/> Apply to Profile</button>
        :<button onClick={()=>fileRef.current?.click()} disabled={phase!=="idle"} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:phase==="idle"?"linear-gradient(135deg,#5C0F8B,#0D6EFD)":"#E5E7EB",color:phase==="idle"?"#fff":"#9CA3AF"}}><Upload size={17}/> {phase==="idle"?"Select CV File":"Processing…"}</button>}
        <button onClick={onSkip} className="w-full py-3 rounded-2xl font-semibold text-sm text-gray-400 hover:text-gray-600 transition-colors">Skip — I'll fill in manually</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Language components
// ─────────────────────────────────────────────────────────────────────────────

function SkillsRow({ skills,onChange,color }: { skills:LangSkills;onChange:(s:LangSkills)=>void;color:string }) {
  return (
    <div className="flex gap-2 mt-1 ml-1">
      {(["speak","read","write"] as const).map(skill=>(
        <button key={skill} onClick={()=>onChange({...skills,[skill]:!skills[skill]})} className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all"
          style={{borderColor:skills[skill]?color:"#E5E7EB",background:skills[skill]?`${color}18`:"#F9FAFB",color:skills[skill]?color:"#9CA3AF"}}>
          {skills[skill]?<Check size={9} strokeWidth={3}/>:null}
          {skill.charAt(0).toUpperCase()+skill.slice(1)}
        </button>
      ))}
    </div>
  );
}

function LangCard({ name,skills,onSkillChange,onRemove,color,locked }: { name:string;skills:LangSkills;onSkillChange:(s:LangSkills)=>void;onRemove?:()=>void;color:string;locked?:boolean }) {
  return (
    <div className="rounded-xl border px-3 py-2.5" style={{borderColor:`${color}30`,background:`${color}08`}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{background:color}}/>
          <span className="text-sm font-bold text-gray-800">{name}</span>
          {locked&&<span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{background:`${color}20`,color}}> National</span>}
        </div>
        {onRemove&&<button onClick={onRemove} className="text-xs text-gray-300 hover:text-red-400 transition-colors font-bold">✕</button>}
      </div>
      <SkillsRow skills={skills} onChange={onSkillChange} color={color}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KYC for profile step 1 (reuse existing KycUploadSection)
// Profile Step 1
// ─────────────────────────────────────────────────────────────────────────────

function ProfileStep1({ data,setData,email,phone,onNext,onBack }: { data:PersonalDetails;setData:(d:PersonalDetails)=>void;email:string;phone:string;onNext:()=>void;onBack:()=>void }) {
  const [regionalDropdown,setRegionalDropdown]=useState("");
  const [foreignDropdown,setForeignDropdown]=useState("");
  const age=calcAge(data.dob);const dobUnder18=age!==null&&age<18;const dobValid=age!==null&&age>=18;
  const alreadyRegional=data.regionalLangs.map(e=>e.lang);
  const alreadyForeign=data.foreignLangs.map(e=>e.lang);
  const availableRegional=INDIA_REGIONAL_LANGS.filter(l=>!alreadyRegional.includes(l));
  const availableForeign=FOREIGN_LANGS.filter(l=>!alreadyForeign.includes(l));
  function addRegional(lang:string){if(!lang||alreadyRegional.includes(lang))return;setData({...data,regionalLangs:[...data.regionalLangs,{lang,skills:{...BLANK_SKILLS}}]});setRegionalDropdown("")}
  function removeRegional(lang:string){setData({...data,regionalLangs:data.regionalLangs.filter(e=>e.lang!==lang)})}
  function updateRegionalSkills(lang:string,skills:LangSkills){setData({...data,regionalLangs:data.regionalLangs.map(e=>e.lang===lang?{...e,skills}:e)})}
  function addForeign(lang:string){if(!lang||alreadyForeign.includes(lang)||data.foreignLangs.length>=3)return;setData({...data,foreignLangs:[...data.foreignLangs,{lang,skills:{...BLANK_SKILLS}}]});setForeignDropdown("")}
  function removeForeign(lang:string){setData({...data,foreignLangs:data.foreignLangs.filter(e=>e.lang!==lang)})}
  function updateForeignSkills(lang:string,skills:LangSkills){setData({...data,foreignLangs:data.foreignLangs.map(e=>e.lang===lang?{...e,skills}:e)})}
  function updateNationalSkills(lang:string,skills:LangSkills){setData({...data,nationalSkills:{...data.nationalSkills,[lang]:skills}})}
  const isValid=!!(data.firstName.trim()&&data.lastName.trim()&&dobValid&&data.gender);
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Personal Details" subtitle="Step 1 of 3 — Basic information" onBack={onBack} step={1} total={3} pill="Profile Setup"/>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Verified Identity</p><IdentifierChips email={email} phone={phone}/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>Legal First Name</FieldLabel><TextInput value={data.firstName} onChange={v=>setData({...data,firstName:v})} placeholder="Arnab" accent={data.firstName?"#0D6EFD":undefined}/></div>
          <div><FieldLabel>Legal Last Name</FieldLabel><TextInput value={data.lastName} onChange={v=>setData({...data,lastName:v})} placeholder="Khasnobis" accent={data.lastName?"#0D6EFD":undefined}/></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel>Date of Birth</FieldLabel>
            {age!==null&&<span className="text-xs font-black" style={{color:dobUnder18?"#EF4444":"#198754"}}>Age: {age} yrs</span>}
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><Calendar size={16} color={dobValid?"#198754":dobUnder18?"#EF4444":"#9CA3AF"}/></div>
            <input type="date" value={data.dob} max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]}
              onChange={e=>setData({...data,dob:e.target.value})}
              className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all"
              style={{borderColor:dobUnder18?"#EF4444":dobValid?"#198754":"#E5E7EB"}}/>
          </div>
          {dobUnder18&&<div className="flex items-center gap-1.5 mt-1.5 px-1"><AlertTriangle size={11} color="#EF4444" className="flex-shrink-0"/><p className="text-xs font-semibold text-red-500">Must be at least 18 years old.</p></div>}
          {dobValid&&<div className="flex items-center gap-1.5 mt-1.5 px-1"><Check size={11} color="#198754" className="flex-shrink-0"/><p className="text-xs font-semibold text-green-600">Age verified — {age} years old.</p></div>}
        </div>
        <div>
          <FieldLabel>Gender</FieldLabel>
          <div className="relative">
            <select value={data.gender} onChange={e=>setData({...data,gender:e.target.value})} className="w-full appearance-none rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all" style={{borderColor:data.gender?"#0D6EFD":"#E5E7EB"}}>
              <option value="">Select gender…</option>{GENDER_OPTIONS.map(g=><option key={g}>{g}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Language Proficiency</p>
          <p className="text-xs text-gray-400 -mt-2 leading-relaxed">Select Speak / Read / Write for each language.</p>
          <div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">National Languages (India)</p><div className="space-y-2">{INDIA_NATIONAL_LANGS.map(lang=><LangCard key={lang} name={lang} locked skills={data.nationalSkills[lang]??{...BLANK_SKILLS}} onSkillChange={s=>updateNationalSkills(lang,s)} color="#0D6EFD"/>)}</div></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-2">Regional Languages (India — Scheduled)</p>
            {data.regionalLangs.length>0&&<div className="space-y-2 mb-2">{data.regionalLangs.map(entry=><LangCard key={entry.lang} name={entry.lang} skills={entry.skills} onSkillChange={s=>updateRegionalSkills(entry.lang,s)} onRemove={()=>removeRegional(entry.lang)} color="#5C0F8B"/>)}</div>}
            <div className="relative"><select value={regionalDropdown} onChange={e=>addRegional(e.target.value)} className="w-full appearance-none rounded-2xl px-4 py-3 pr-10 text-sm font-medium bg-white border-2 border-dashed text-gray-600 focus:outline-none transition-all" style={{borderColor:"#DDD6FE"}}><option value="">+ Add regional language…</option>{availableRegional.map(l=><option key={l} value={l}>{l}</option>)}</select><ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-300"/></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Foreign Languages</p><span className="text-[10px] font-black text-gray-400">{data.foreignLangs.length}/3 max</span></div>
            {data.foreignLangs.length>0&&<div className="space-y-2 mb-2">{data.foreignLangs.map(entry=><LangCard key={entry.lang} name={entry.lang} skills={entry.skills} onSkillChange={s=>updateForeignSkills(entry.lang,s)} onRemove={()=>removeForeign(entry.lang)} color="#D97706"/>)}</div>}
            {data.foreignLangs.length<3?<div className="relative"><select value={foreignDropdown} onChange={e=>addForeign(e.target.value)} className="w-full appearance-none rounded-2xl px-4 py-3 pr-10 text-sm font-medium bg-white border-2 border-dashed text-gray-600 focus:outline-none transition-all" style={{borderColor:"#FDE68A"}}><option value="">+ Add foreign language…</option>{availableForeign.map(l=><option key={l} value={l}>{l}</option>)}</select><ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-300"/></div>:<div className="rounded-xl px-4 py-2.5 text-xs font-semibold text-amber-600 text-center" style={{background:"#FFFBEB",border:"1px dashed #FCD34D"}}>Maximum 3 foreign languages reached.</div>}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}><Info size={15} color="#D97706" className="flex-shrink-0 mt-0.5"/><p className="text-xs font-semibold text-amber-700 leading-relaxed"><span className="font-black">Name must match your National ID.</span> KYC verification is mandatory for India.</p></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"#D97706"}}><ScanLine size={11} color="white"/></div><p className="text-xs font-black uppercase tracking-widest text-amber-600">KYC — National ID Verification</p><span className="text-[9px] font-black text-red-400 uppercase tracking-wide ml-1">Required</span></div>
          <KycUploadSection/>
        </div>
      </div>
      <ProceedBtn label="Continue to Professional Info" onClick={onNext} disabled={!isValid}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Step 2
// ─────────────────────────────────────────────────────────────────────────────

function UploadSlot({ index,label,fileName,onFile,color="#0D6EFD",required }: { index:number;label?:string;fileName:string;onFile:(name:string)=>void;color?:string;required?:boolean }) {
  const ref=useRef<HTMLInputElement>(null);
  return (
    <button onClick={()=>ref.current?.click()} className="w-full rounded-2xl border-2 border-dashed px-4 py-3.5 flex items-center gap-3 transition-all active:scale-[0.98] text-left"
      style={{borderColor:fileName?color:required&&!fileName?"#FCA5A5":"#D1D5DB",background:fileName?`${color}0D`:required&&!fileName?"#FFF5F5":"#FAFAFA"}}>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f.name)}}/>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:fileName?color:"#F3F4F6"}}>
        {fileName?<FileText size={17} color="white"/>:<Upload size={17} color="#9CA3AF"/>}
      </div>
      <div className="flex-1 min-w-0">
        {label&&<p className="text-[10px] font-black uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>}
        {fileName?<p className="text-sm font-bold truncate" style={{color}}>{fileName}</p>:<p className="text-sm font-medium text-gray-400">{required?"Upload required":`Upload file ${index+1}`}<span className="text-xs text-gray-300 ml-1">PDF / JPG / PNG</span></p>}
      </div>
      {fileName&&<p className="text-[10px] font-bold text-gray-300 flex-shrink-0">Replace</p>}
    </button>
  );
}

function ProfileStep2({ data,setData,onNext,onBack }: { data:ProfessionalDetails;setData:(d:ProfessionalDetails)=>void;onNext:()=>void;onBack:()=>void }) {
  const isValid=data.education!==""&&data.eduCertFile!=="";
  function toggleQual(q:string){const list=data.profQuals.includes(q)?data.profQuals.filter(x=>x!==q):[...data.profQuals,q];setData({...data,profQuals:list})}
  function setProfCert(idx:number,name:string){const arr=[...data.profCertFiles];arr[idx]=name;setData({...data,profCertFiles:arr})}
  function setVocName(idx:number,name:string){const arr=data.vocationalCerts.map((v,i)=>i===idx?{...v,name}:v);setData({...data,vocationalCerts:arr})}
  function setVocFile(idx:number,fileName:string){const arr=data.vocationalCerts.map((v,i)=>i===idx?{...v,fileName}:v);setData({...data,vocationalCerts:arr})}
  const showOther=data.profQuals.includes("Any Other");
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Education & Qualifications" subtitle="Step 2 of 3 — Academic & professional background" onBack={onBack} step={2} total={3} pill="Profile Setup"/>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"#0D6EFD"}}><span className="text-[9px] font-black text-white">A</span></div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Highest Education Level</p><span className="text-[9px] font-black text-red-400 uppercase tracking-wide">Required</span></div>
          <div className="space-y-2">{EDUCATION_OPTIONS_NEW.map(opt=><RadioCard key={opt} label={opt} selected={data.education===opt} onSelect={()=>setData({...data,education:opt})} color="#0D6EFD"/>)}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"#0D6EFD"}}><span className="text-[9px] font-black text-white">B</span></div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Highest Education Certificate</p><span className="text-[9px] font-black text-red-400 uppercase tracking-wide">Required</span></div>
          <UploadSlot index={0} fileName={data.eduCertFile} required onFile={n=>setData({...data,eduCertFile:n})} color="#0D6EFD"/>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"#5C0F8B"}}><span className="text-[9px] font-black text-white">C</span></div><p className="text-xs font-black uppercase tracking-widest text-purple-600">Professional Qualification</p><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Optional</span></div>
          <p className="text-xs text-gray-400 mb-3 ml-7">Select all that apply. Upload up to 3 certificates.</p>
          <div className="bg-white rounded-2xl border overflow-hidden mb-3" style={{borderColor:"#E5E7EB",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            {PROFESSIONAL_QUALS.map(q=><div key={q} className="border-b last:border-b-0" style={{borderColor:"#F3F4F6"}}><Checkbox label={q} checked={data.profQuals.includes(q)} onChange={()=>toggleQual(q)} color="#5C0F8B"/></div>)}
          </div>
          <AnimatePresence>
            {showOther&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden mb-3">
              <input type="text" value={data.profQualOther} onChange={e=>setData({...data,profQualOther:e.target.value})} placeholder="Write qualification name…" className="w-full rounded-2xl px-4 py-3 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all placeholder:text-gray-300" style={{borderColor:data.profQualOther?"#5C0F8B":"#DDD6FE"}}/>
            </motion.div>}
          </AnimatePresence>
          {data.profQuals.length>0&&<div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Certificate Uploads</p>{[0,1,2].map(i=><UploadSlot key={i} index={i} fileName={data.profCertFiles[i]??""} onFile={n=>setProfCert(i,n)} color="#5C0F8B"/>)}</div>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"#198754"}}><span className="text-[9px] font-black text-white">D</span></div><p className="text-xs font-black uppercase tracking-widest text-green-700">Vocational Education & Training</p><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Optional</span></div>
          <p className="text-xs text-gray-400 mb-3 ml-7">Name each certificate and upload the document.</p>
          <div className="space-y-3">
            {[0,1,2].map(i=>(
              <div key={i} className="rounded-2xl border p-3 space-y-2" style={{borderColor:data.vocationalCerts[i]?.fileName?"#BBF7D0":"#E5E7EB",background:data.vocationalCerts[i]?.fileName?"#F0FDF4":"#FAFAFA"}}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Certificate {i+1}</p>
                <input type="text" value={data.vocationalCerts[i]?.name??""} onChange={e=>setVocName(i,e.target.value)} placeholder="e.g. Basic Life Support (BLS)" className="w-full rounded-xl px-3 py-2.5 text-sm font-medium bg-white border text-gray-800 focus:outline-none transition-all placeholder:text-gray-300" style={{borderColor:data.vocationalCerts[i]?.name?"#198754":"#E5E7EB"}}/>
                <UploadSlot index={i} fileName={data.vocationalCerts[i]?.fileName??""} onFile={n=>setVocFile(i,n)} color="#198754"/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ProceedBtn label="Continue to Capabilities" onClick={onNext} disabled={!isValid}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Step 3
// ─────────────────────────────────────────────────────────────────────────────

function ProfileStep3({ data,setData,onNext,onBack }: { data:CapabilitiesState;setData:(d:CapabilitiesState)=>void;onNext:()=>void;onBack:()=>void }) {
  const [activeTab,setActiveTab]=useState<"A"|"B">("A");
  const totalA=Object.values(data.sectionA).filter(Boolean).length;
  const totalB=Object.values(data.sectionB).filter(Boolean).length;
  const isValid=totalA+totalB>0;
  function ActivityGroup({ title,items,state,onChange,color,badge }: { title:string;items:string[];state:Record<string,boolean>;onChange:(k:string,v:boolean)=>void;color:string;badge:string }) {
    const count=items.filter(i=>state[i]).length;
    return (
      <div className="bg-white rounded-2xl border mb-3" style={{borderColor:"#E5E7EB",boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div><h3 className="text-sm font-bold text-gray-900">{title}</h3><p className="text-xs text-gray-400 mt-0.5">{badge}</p></div>
          <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{background:`${color}18`,color}}>{count}/{items.length}</span>
        </div>
        <div className="px-3 pb-3 divide-y divide-gray-50">{items.map(item=><Checkbox key={item} label={item} checked={!!state[item]} onChange={v=>onChange(item,v)} color={color}/>)}</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Care Categories & Activities" subtitle="Step 3 of 3 — Select your capabilities" onBack={onBack} step={3} total={3} pill="Profile Setup"/>
      <div className="px-6 pt-4 pb-2 flex-shrink-0">
        <div className="flex rounded-2xl p-1 gap-1" style={{background:"#F3F4F6"}}>
          {(["A","B"] as const).map(t=>{const count=t==="A"?totalA:totalB;const active=activeTab===t;return(
            <button key={t} onClick={()=>setActiveTab(t)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
              style={{background:active?"#fff":"transparent",color:active?(t==="A"?"#0D6EFD":"#5C0F8B"):"#9CA3AF",boxShadow:active?"0 2px 8px rgba(0,0,0,0.10)":"none"}}>
              {t==="A"?"Section A: Medical Care":"Section B: Non-Medical"}
              {count>0&&<span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center" style={{background:t==="A"?"#0D6EFD":"#5C0F8B",color:"#fff"}}>{count}</span>}
            </button>
          )})}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab==="A"?<motion.div key="A" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}} className="absolute inset-0 overflow-y-auto px-6 py-3">
            <div className="rounded-2xl px-4 py-2.5 border flex items-center gap-2 mb-3" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}><CheckSquare size={14} color="#0D6EFD"/><p className="text-xs font-bold text-blue-700">Licensed medical & clinical activities</p></div>
            <ActivityGroup title="Physical Personal Care" badge="ADLs — Items 1–8" items={ADL_ITEMS} state={data.sectionA} onChange={(k,v)=>setData({...data,sectionA:{...data.sectionA,[k]:v}})} color="#0D6EFD"/>
            <ActivityGroup title="Medical Assistance" badge="IADLs — Items 9–14" items={IADL_ITEMS} state={data.sectionA} onChange={(k,v)=>setData({...data,sectionA:{...data.sectionA,[k]:v}})} color="#0D6EFD"/>
            <ActivityGroup title="Clinical Care" badge="Licensed Procedures" items={MEDICAL_LICENSED} state={data.sectionA} onChange={(k,v)=>setData({...data,sectionA:{...data.sectionA,[k]:v}})} color="#0D6EFD"/>
          </motion.div>:<motion.div key="B" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} transition={{duration:0.22}} className="absolute inset-0 overflow-y-auto px-6 py-3">
            <div className="rounded-2xl px-4 py-2.5 border flex items-center gap-2 mb-3" style={{background:"#F5F0FF",borderColor:"#DDD6FE"}}><CheckSquare size={14} color="#5C0F8B"/><p className="text-xs font-bold text-purple-700">Support & companion care activities</p></div>
            <ActivityGroup title="Companion & Support Care" badge="Daily Support" items={NON_MEDICAL_SUPPORT} state={data.sectionB} onChange={(k,v)=>setData({...data,sectionB:{...data.sectionB,[k]:v}})} color="#5C0F8B"/>
          </motion.div>}
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0 px-6 pb-8 pt-3" style={{boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",background:"#F8F9FA"}}>
        <button onClick={onNext} disabled={!isValid} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{background:isValid?"linear-gradient(135deg,#198754 0%,#0D6EFD 100%)":"#E5E7EB",color:isValid?"#fff":"#9CA3AF",boxShadow:isValid?"0 4px 20px rgba(25,135,84,0.28)":"none",cursor:isValid?"pointer":"not-allowed"}}>
          <ShieldCheck size={18}/> Complete Profile & Save
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Salary Engine
// ─────────────────────────────────────────────────────────────────────────────

function ScreenSalary({ personalData,salary,setSalary,onComplete,onBack }: { personalData:PersonalDetails;salary:SalaryTier;setSalary:(t:SalaryTier)=>void;onComplete?:()=>void;onBack?:()=>void }) {
  const [submitted,setSubmitted]=useState(false);
  const name=[personalData.firstName,personalData.lastName].filter(Boolean).join(" ")||"Caregiver";
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Salary Engine" subtitle="Your personalised daily rate" step={5} total={5} pill="Step 5 of 5" onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="rounded-2xl p-4 mb-5 border" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Profile Summary</p>
          <div className="grid grid-cols-2 gap-y-2">
            {[{label:"Name",value:name},{label:"DOB",value:personalData.dob||"—"},{label:"Gender",value:personalData.gender||"—"},{label:"Location",value:"Mumbai, MH"}].map(({label,value})=>(
              <div key={label}><p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{label}</p><p className="text-xs font-bold text-blue-900 truncate">{value}</p></div>
            ))}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Daily Rate Options</p>
        <div className="space-y-3 mb-5">
          {SALARY_OPTIONS.map(opt=>{const sel=salary===opt.id;return(
            <button key={opt.id} onClick={()=>setSalary(opt.id)} className="w-full rounded-2xl p-4 flex items-center gap-4 border-2 transition-all active:scale-[0.98] text-left"
              style={{borderColor:sel?opt.selBorder:opt.border,background:sel?(opt.id==="recommended"?"#E2F0FF":opt.id==="premium"?"#F5F0FF":"#F9FAFB"):"#fff",boxShadow:sel?`0 0 0 3px ${opt.color}18`:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{borderColor:sel?opt.color:"#D1D5DB"}}>{sel&&<div className="w-2.5 h-2.5 rounded-full" style={{background:opt.color}}/>}</div>
              <div className="flex-1"><div className="flex items-baseline gap-1"><span className="text-2xl font-black" style={{color:opt.color}}>{opt.rate}</span><span className="text-xs text-gray-400">/ day</span></div><p className="text-xs text-gray-500 mt-0.5">{opt.subtitle}</p></div>
              {opt.featured&&<div className="rounded-full px-2.5 py-1 text-xs font-bold" style={{background:"#0D6EFD",color:"#fff"}}>★ Best</div>}
            </button>
          )})}
        </div>
        <div className="rounded-2xl p-4 flex items-start gap-3 border" style={{background:"#F0FDF4",borderColor:"#BBF7D0"}}>
          <ShieldCheck size={20} color="#198754" className="flex-shrink-0 mt-0.5"/>
          <div><p className="text-xs font-bold text-green-800 mb-0.5">Programmatic Guardrail Active</p><p className="text-xs text-green-700 leading-relaxed">Daily rates are cleanly rounded to the nearest ₹50 and locked above statutory state minimum wage laws.</p></div>
        </div>
      </div>
      <div className="px-6 pb-8 pt-3">
        {submitted?<motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2" style={{background:"#DCFCE7"}}><ShieldCheck size={20} color="#198754"/><span className="font-bold text-green-700">Profile Submitted! 🎉</span></motion.div>
        :<button onClick={()=>{setSubmitted(true);setTimeout(()=>onComplete?.(),1400)}} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#5C0F8B 0%,#0D6EFD 100%)",color:"#fff",boxShadow:"0 4px 20px rgba(13,110,253,0.30)"}}><DollarSign size={18}/> Submit Profile</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Photo Screen
// ─────────────────────────────────────────────────────────────────────────────

function ScreenProfilePhoto({ name,onDone,onBack }: { name:string;onDone:(url:string)=>void;onBack?:()=>void }) {
  const [photoURL,setPhotoURL]=useState<string|null>(null);
  const [confirmed,setConfirmed]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  function handleFile(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(f)setPhotoURL(URL.createObjectURL(f))}
  function handleDone(){setConfirmed(true);setTimeout(()=>onDone(photoURL??""),1200)}
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-6 flex-shrink-0" style={{background:"linear-gradient(155deg,#5C0F8B 0%,#0D6EFD 100%)"}}>
        {onBack&&<button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold mb-3 transition-colors"><ArrowLeft size={15}/> Back</button>}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{background:"rgba(255,255,255,0.15)"}}><Camera size={20} color="white"/></div>
        <h1 className="text-xl font-black text-white">Profile Photo</h1>
        <p className="text-sm text-white/65 mt-1 leading-relaxed">Last step — add a photo to complete your registration.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5 border" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}><Info size={15} color="#D97706" className="flex-shrink-0 mt-0.5"/><div><p className="text-xs font-black text-amber-700 mb-0.5">Must match your National ID</p><p className="text-xs text-amber-600 leading-relaxed">Your profile photo is cross-checked against your KYC document. Future changes take up to <span className="font-black">3 working days</span> to verify.</p></div></div>
        <div className="flex flex-col items-center gap-4 py-4">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
          <button onClick={()=>!photoURL&&fileRef.current?.click()} className="relative transition-all active:scale-[0.97]" style={{cursor:photoURL?"default":"pointer"}}>
            <div className="absolute inset-0 rounded-full" style={{margin:-6,background:photoURL?"conic-gradient(#198754,#0D6EFD,#5C0F8B,#198754)":"conic-gradient(#E5E7EB,#E5E7EB)",borderRadius:"50%",padding:3}}><div className="w-full h-full rounded-full" style={{background:"#F8F9FA"}}/></div>
            <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center relative z-10" style={{background:photoURL?"transparent":"#F3F4F6"}}>
              {photoURL?<img src={photoURL} alt="Profile" className="w-full h-full object-cover"/>:<div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"#E5E7EB"}}><User size={28} color="#9CA3AF"/></div><span className="text-[10px] font-bold text-gray-400">Tap to upload</span></div>}
            </div>
            {!photoURL&&<div className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center z-20 border-2 border-white" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)"}}><Camera size={16} color="white"/></div>}
          </button>
          {photoURL&&<div className="flex flex-col items-center gap-2"><div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{background:"#DCFCE7"}}><Check size={13} color="#198754" strokeWidth={3}/><span className="text-xs font-bold text-green-700">Photo uploaded</span></div><button onClick={()=>fileRef.current?.click()} className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"><RotateCcw size={11}/> Change photo</button></div>}
        </div>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)"}}><User size={18} color="white"/></div>
          <div className="flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Registering as</p><p className="text-sm font-black text-blue-900">{name||"Care Professional"}</p></div>
          <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{background:"#DCFCE7"}}><ShieldCheck size={11} color="#198754"/><span className="text-[10px] font-black text-green-700">KYC Pending</span></div>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#F5F0FF",borderColor:"#DDD6FE"}}><Lock size={14} color="#5C0F8B" className="flex-shrink-0 mt-0.5"/><p className="text-xs text-purple-700 leading-relaxed font-semibold">After upload, your photo is locked for <span className="font-black">3 working days</span> while verified against your National ID.</p></div>
      </div>
      <div className="px-6 pb-8 pt-3 space-y-2 flex-shrink-0">
        <AnimatePresence mode="wait">
          {confirmed?<motion.div key="done" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2" style={{background:"#DCFCE7"}}><ShieldCheck size={18} color="#198754"/><span className="font-black text-green-700">Registration Complete! 🎉</span></motion.div>
          :<motion.div key="btns" className="space-y-2">
            <button onClick={handleDone} disabled={!photoURL} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{background:photoURL?"linear-gradient(135deg,#198754,#0D6EFD)":"#E5E7EB",color:photoURL?"#fff":"#9CA3AF",boxShadow:photoURL?"0 4px 20px rgba(25,135,84,0.28)":"none",cursor:photoURL?"pointer":"not-allowed"}}>
              <ShieldCheck size={17}/> Complete Registration
            </button>
            <button onClick={()=>onDone("")} className="w-full py-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">Skip — add photo later</button>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employer Step 1
// ─────────────────────────────────────────────────────────────────────────────

function ScreenEmployerStep1({ data,setData,kind,subRole,email,phone,onNext,onBack }: { data:EmployerDetails;setData:(d:EmployerDetails)=>void;kind:EmployerKind;subRole:string;email:string;phone:string;onNext:()=>void;onBack:()=>void }) {
  const age=calcAge(data.dob);const dobOk=age!==null&&age>=18;const dobBad=age!==null&&age<18;
  const kindColor=kind==="individual"?"#0D6EFD":kind==="agency"?"#198754":"#5C0F8B";
  function tf(label:string,key:keyof EmployerDetails,placeholder?:string,type="text"){return(<div key={label}><FieldLabel>{label}</FieldLabel><TextInput value={data[key] as string} onChange={v=>setData({...data,[key]:v})} placeholder={placeholder} type={type} accent={(data[key] as string)?kindColor:undefined}/></div>)}
  function sel(label:string,key:keyof EmployerDetails,opts:string[],ph="Select…"){return(<div key={label}><FieldLabel>{label}</FieldLabel><div className="relative"><select value={data[key] as string} onChange={e=>setData({...data,[key]:e.target.value})} className="w-full appearance-none rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all" style={{borderColor:(data[key] as string)?kindColor:"#E5E7EB"}}><option value="">{ph}</option>{opts.map(o=><option key={o}>{o}</option>)}</select><ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/></div></div>)}
  const addrFilled=data.addrCity&&data.addrState;
  const isValid=kind==="individual"?!!(data.firstName&&data.lastName&&dobOk&&addrFilled):!!(data.orgName&&addrFilled&&data.contactPerson);
  return (
    <div className="flex flex-col h-full">
      <GradHeader title={kind==="individual"?"Individual Profile":kind==="agency"?"Care Agency Profile":"Organisation Profile"} subtitle={`Step 1 of 2 — ${subRole}`} onBack={onBack} step={1} total={2} pill="Employer Setup"/>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Verified Identity</p><IdentifierChips email={email} phone={phone}/></div>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 border" style={{background:`${kindColor}0F`,borderColor:`${kindColor}30`}}><div className="w-2 h-2 rounded-full" style={{background:kindColor}}/><p className="text-xs font-black" style={{color:kindColor}}>{subRole}</p></div>
        {kind==="individual"&&(<>
          <SectionDivider label="Your Personal Details" color="#0D6EFD"/>
          <div className="grid grid-cols-2 gap-3">{tf("First Name","firstName","e.g. Priya")}{tf("Last Name","lastName","e.g. Sharma")}</div>
          <div>
            <div className="flex items-center justify-between mb-1.5"><FieldLabel>Date of Birth</FieldLabel>{age!==null&&<span className="text-xs font-black" style={{color:dobBad?"#EF4444":"#198754"}}>Age: {age} yrs</span>}</div>
            <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><Calendar size={16} color={dobOk?"#198754":dobBad?"#EF4444":"#9CA3AF"}/></div>
            <input type="date" value={data.dob} max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]} onChange={e=>setData({...data,dob:e.target.value})} className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all" style={{borderColor:dobBad?"#EF4444":dobOk?"#198754":"#E5E7EB"}}/></div>
            {dobBad&&<p className="text-xs font-semibold text-red-500 mt-1 ml-1">Must be at least 18 years old.</p>}
          </div>
          {sel("Gender","gender",["Male","Female","Non-binary","Prefer not to say"])}
          <SectionDivider label="Care Recipient Details" color="#0D6EFD"/>
          {sel("Relationship to Recipient","relationship",["Self","Spouse / Partner","Parent","Child","Sibling","Guardian","Other"])}
          {tf("Recipient's Name","recipientName","e.g. Ramesh Sharma")}
          {tf("Recipient's Age","recipientAge","e.g. 72","number")}
          {tf("Primary Condition / Diagnosis","condition","e.g. Post-stroke rehabilitation")}
          <SectionDivider label="Care Preferences" color="#0D6EFD"/>
          {sel("Type of Care Needed","careType",["Live-in (24/7)","Daytime Only","Hourly / On-call","Night Duty","Respite Care"])}
          {tf("Budget (₹ / day)","budget","e.g. 1200","number")}
          <SectionDivider label="Address" color="#0D6EFD"/>
          <AddressPinFields accentColor="#0D6EFD" values={addrFromEmployer(data)} onChange={a=>setData(applyAddrToEmployer(data,a))}/>
          <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 border" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}><Info size={14} color="#D97706" className="flex-shrink-0 mt-0.5"/><p className="text-xs font-semibold text-amber-700 leading-relaxed">Name must match your National ID. KYC verification is mandatory.</p></div>
          <KycUploadSection/>
        </>)}
        {kind==="agency"&&(<>
          <SectionDivider label="Agency Details" color="#198754"/>
          {tf("Agency / Organisation Name","orgName","e.g. CarePlus Home Services")}
          {tf("Registration / License Number","regNumber","e.g. MH-HCA-2024-0012")}
          {tf("Total Care Staff","staffCount","e.g. 45","number")}
          {tf("Operating Hours","operatingHours","e.g. Mon–Sat, 8 AM – 8 PM")}
          <SectionDivider label="Primary Contact" color="#198754"/>
          {tf("Contact Person Name","contactPerson","e.g. Neha Gupta")}
          {tf("Designation","designation","e.g. Operations Manager")}
          <SectionDivider label="Address" color="#198754"/>
          <AddressPinFields accentColor="#198754" values={addrFromEmployer(data)} onChange={a=>setData(applyAddrToEmployer(data,a))}/>
        </>)}
        {kind==="corporate"&&(<>
          <SectionDivider label="Organisation Details" color="#5C0F8B"/>
          {tf("Organisation Name","orgName","e.g. Apollo Hospitals Pvt. Ltd.")}
          {tf("Registration / CIN Number","regNumber","e.g. U85110MH2001PTC123456")}
          {tf("Bed Capacity / Dept. Size","bedCapacity","e.g. 350 beds")}
          {tf("Departments / Units","departments","e.g. ICU, Geriatrics, Oncology")}
          {sel("Hiring Contract Type","contractType",["Full-time","Part-time","Contract / Locum","Per-assignment","Internship / Trainee"])}
          <SectionDivider label="HR / Hiring Contact" color="#5C0F8B"/>
          {tf("Contact Person Name","contactPerson","e.g. Rajan Mehta")}
          {tf("Designation","designation","e.g. Head of Human Resources")}
          <SectionDivider label="Address" color="#5C0F8B"/>
          <AddressPinFields accentColor="#5C0F8B" values={addrFromEmployer(data)} onChange={a=>setData(applyAddrToEmployer(data,a))}/>
        </>)}
      </div>
      <ProceedBtn label="Continue to Services Required" onClick={onNext} disabled={!isValid}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employer Step 2 — Services Required
// ─────────────────────────────────────────────────────────────────────────────

function ScreenEmployerStep2({ data,setData,kind,onNext,onBack }: { data:EmployerServicesState;setData:(d:EmployerServicesState)=>void;kind:EmployerKind;onNext:()=>void;onBack:()=>void }) {
  const [activeTab,setActiveTab]=useState<"A"|"B">("A");
  const totalA=Object.values(data.sectionA).filter(Boolean).length;
  const totalB=Object.values(data.sectionB).filter(Boolean).length;
  const total=totalA+totalB;
  const accentColor=kind==="individual"?"#0D6EFD":kind==="agency"?"#198754":"#5C0F8B";
  function ServiceGroup({ title,items,stateMap,onChange,color,badge }: { title:string;items:string[];stateMap:Record<string,boolean>;onChange:(k:string,v:boolean)=>void;color:string;badge:string }) {
    const count=items.filter(i=>stateMap[i]).length;
    return(<div className="bg-white rounded-2xl border mb-3" style={{borderColor:"#E5E7EB",boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2"><div><h3 className="text-sm font-bold text-gray-900">{title}</h3><p className="text-xs text-gray-400 mt-0.5">{badge}</p></div><span className="text-xs font-black px-2.5 py-1 rounded-full" style={{background:`${color}18`,color}}>{count}/{items.length}</span></div>
      <div className="px-3 pb-3 divide-y divide-gray-50">{items.map(item=><Checkbox key={item} label={item} checked={!!stateMap[item]} onChange={v=>onChange(item,v)} color={color}/>)}</div>
    </div>);
  }
  return (
    <div className="flex flex-col h-full">
      <GradHeader title="Services Required" subtitle="Step 2 of 2 — Select care activities needed" onBack={onBack} step={2} total={2} pill="Employer Setup"/>
      <div className="px-6 pt-4 pb-2 flex-shrink-0">
        <div className="flex rounded-2xl p-1 gap-1" style={{background:"#F3F4F6"}}>
          {(["A","B"] as const).map(t=>{const count=t==="A"?totalA:totalB;const active=activeTab===t;return(
            <button key={t} onClick={()=>setActiveTab(t)} className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
              style={{background:active?"#fff":"transparent",color:active?accentColor:"#9CA3AF",boxShadow:active?"0 2px 8px rgba(0,0,0,0.10)":"none"}}>
              {t==="A"?"Medical Care":"Non-Medical Support"}
              {count>0&&<span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center" style={{background:accentColor,color:"#fff"}}>{count}</span>}
            </button>
          )})}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab==="A"?<motion.div key="A" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:0.2}} className="absolute inset-0 overflow-y-auto px-6 py-3">
            <div className="rounded-2xl px-4 py-2.5 border flex items-center gap-2 mb-3" style={{background:`${accentColor}0F`,borderColor:`${accentColor}30`}}><CheckSquare size={14} color={accentColor}/><p className="text-xs font-bold" style={{color:accentColor}}>Select licensed medical care services you require</p></div>
            <ServiceGroup title="Physical Personal Care" badge="ADLs — Items 1–8" items={ADL_ITEMS} stateMap={data.sectionA} onChange={(k,v)=>setData({...data,sectionA:{...data.sectionA,[k]:v}})} color={accentColor}/>
            <ServiceGroup title="Medical Assistance" badge="IADLs — Items 9–14" items={IADL_ITEMS} stateMap={data.sectionA} onChange={(k,v)=>setData({...data,sectionA:{...data.sectionA,[k]:v}})} color={accentColor}/>
            <ServiceGroup title="Clinical & Specialised" badge="Licensed + Emergency" items={[...MEDICAL_LICENSED,...SPECIALIZED_ITEMS_EXTRA]} stateMap={data.sectionA} onChange={(k,v)=>setData({...data,sectionA:{...data.sectionA,[k]:v}})} color={accentColor}/>
          </motion.div>:<motion.div key="B" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}} transition={{duration:0.2}} className="absolute inset-0 overflow-y-auto px-6 py-3">
            <div className="rounded-2xl px-4 py-2.5 border flex items-center gap-2 mb-3" style={{background:"#6B728010",borderColor:"#D1D5DB"}}><CheckSquare size={14} color="#6B7280"/><p className="text-xs font-bold text-gray-500">Select support & companion care services you require</p></div>
            <ServiceGroup title="Companion & Support Care" badge="Daily Support" items={NON_MEDICAL_SUPPORT} stateMap={data.sectionB} onChange={(k,v)=>setData({...data,sectionB:{...data.sectionB,[k]:v}})} color="#6B7280"/>
          </motion.div>}
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0 px-6 pb-8 pt-3" style={{boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",background:"#F8F9FA"}}>
        {total===0&&<p className="text-xs text-gray-400 text-center mb-2">Select at least one service to continue</p>}
        <button onClick={onNext} disabled={total===0} className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{background:total>0?`linear-gradient(135deg,${accentColor},#0D6EFD)`:"#E5E7EB",color:total>0?"#fff":"#9CA3AF",boxShadow:total>0?"0 4px 20px rgba(13,110,253,0.25)":"none",cursor:total>0?"pointer":"not-allowed"}}>
          <ShieldCheck size={17}/> Complete Profile & Save
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Employer Welcome Back
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_EMP = {
  kind:"corporate" as EmployerKind,subRole:"Hospital",orgName:"Apollo Hospitals",
  regNumber:"U85110MH2001PTC123456",contactPerson:"Rajan Mehta",designation:"Head of Human Resources",
  addrCity:"Mumbai",addrState:"Maharashtra",addrLocality:"Bandra Kurla Complex",
  addrPin:"400051",addrStreet:"Plot C-68, G Block, BKC",addrLandmark:"Near MMRDA Ground",
  bedCapacity:"350 beds",departments:"ICU, Geriatrics, Oncology, Palliative",
  contractType:"Full-time",openPositions:8,servicesCount:14,rating:4.7,reviewCount:28,
};

function ScreenEmployerWelcomeBack({ profilePhoto:initPhoto="" }: { profilePhoto?:string }) {
  const [tab,setTab]=useState<"brief"|"detail">("brief");
  const [editMode,setEditMode]=useState(false);
  const [reviewMode,setReviewMode]=useState(false);
  const [saved,setSaved]=useState(false);
  const [adminField,setAdminField]=useState<"email"|"phone"|"identity"|null>(null);
  const [adminReason,setAdminReason]=useState("");
  const [adminSent,setAdminSent]=useState(false);
  const [currentPhoto,setCurrentPhoto]=useState(initPhoto);
  const [photoSheet,setPhotoSheet]=useState(false);
  const [pendingPhoto,setPendingPhoto]=useState<string|null>(null);
  const [photoSubmitted,setPhotoSubmitted]=useState(false);
  const photoChangeRef=useRef<HTMLInputElement>(null);
  const [emp,setEmp]=useState({orgName:MOCK_EMP.orgName,contactPerson:MOCK_EMP.contactPerson,designation:MOCK_EMP.designation,addrCity:MOCK_EMP.addrCity,addrState:MOCK_EMP.addrState,addrLocality:MOCK_EMP.addrLocality,addrPin:MOCK_EMP.addrPin,addrStreet:MOCK_EMP.addrStreet,addrLandmark:MOCK_EMP.addrLandmark,departments:MOCK_EMP.departments,contractType:MOCK_EMP.contractType});
  const [servicesSelected,setServicesSelected]=useState<Set<string>>(new Set(["Bed Mobility","Ambulation","Vital Signs","Medication Reminders","Assisted Feeding","Wound Care","IV Therapy","Post-Surgical Care","Cognitive Engagement","Emergency Response","Companion Care","Meal Preparation","Mobility Assist","Hygiene Support"]));
  function toggleService(s:string){setServicesSelected(prev=>{const n=new Set(prev);n.has(s)?n.delete(s):n.add(s);return n})}
  function handleSave(){setSaved(true);setTimeout(()=>{setSaved(false);setEditMode(false);setReviewMode(false)},1800)}
  const kindColor="#5C0F8B";
  return (
    <div className="flex flex-col h-full relative">
      <input ref={photoChangeRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setPendingPhoto(URL.createObjectURL(f))}}/>
      <AnimatePresence>
        {photoSheet&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.5)"}} onClick={()=>{if(!photoSubmitted){setPhotoSheet(false);setPendingPhoto(null)}}}>
          <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:300}} className="rounded-t-3xl p-6 space-y-4 bg-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-2"/>
            {photoSubmitted?<div className="flex flex-col items-center gap-3 py-4"><div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"#DCFCE7"}}><Check size={26} color="#198754" strokeWidth={3}/></div><p className="font-black text-gray-900 text-base">Request Submitted</p><p className="text-sm text-gray-500 text-center">Verified within <span className="font-black text-purple-700">3 working days</span>.</p></div>
            :<><p className="font-black text-gray-900 text-base">Change Profile Photo</p><div className="flex items-start gap-2 rounded-xl px-3 py-3 border" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}><Info size={13} color="#D97706" className="flex-shrink-0 mt-0.5"/><p className="text-xs font-semibold text-amber-700">Changes take up to <span className="font-black">3 working days</span> to verify.</p></div>
            {!pendingPhoto?<button onClick={()=>photoChangeRef.current?.click()} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed" style={{borderColor:"#BFDBFE",color:"#0D6EFD",background:"#F0F7FF"}}><Camera size={15}/> Select New Photo</button>
            :<button onClick={()=>{setCurrentPhoto(pendingPhoto!);setPhotoSubmitted(true);setTimeout(()=>{setPhotoSheet(false);setPendingPhoto(null);setPhotoSubmitted(false)},2800)}} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)",color:"#fff"}}><ShieldCheck size={15}/> Submit for Verification</button>}
            <button onClick={()=>{setPhotoSheet(false);setPendingPhoto(null)}} className="w-full py-2 text-xs font-semibold text-gray-400">Cancel</button></>}
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
      <AnimatePresence>
        {adminField&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.45)"}} onClick={()=>!adminSent&&setAdminField(null)}>
          <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:300}} className="rounded-t-3xl p-6 space-y-4 bg-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-2"/>
            {adminSent?<div className="flex flex-col items-center gap-3 py-4"><div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"#DCFCE7"}}><Check size={28} color="#198754" strokeWidth={3}/></div><p className="font-black text-gray-900 text-base">Request Sent!</p></div>
            :<><p className="font-black text-gray-900 text-base">Request Identity Change</p><p className="text-xs text-gray-500 leading-relaxed">Verified identity fields cannot be self-edited. State your reason below.</p><textarea value={adminReason} onChange={e=>setAdminReason(e.target.value)} rows={3} placeholder="Reason for change…" className="w-full rounded-2xl px-4 py-3 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none resize-none placeholder:text-gray-300" style={{borderColor:adminReason?"#0D6EFD":"#E5E7EB"}}/><button onClick={()=>{if(!adminReason.trim())return;setAdminSent(true);setTimeout(()=>{setAdminSent(false);setAdminField(null);setAdminReason("")},2500)}} disabled={!adminReason.trim()} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:adminReason.trim()?"linear-gradient(135deg,#5C0F8B,#0D6EFD)":"#E5E7EB",color:adminReason.trim()?"#fff":"#9CA3AF"}}><Mail size={15}/> Send Request to Admin</button></>}
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
      <div className="px-6 pt-7 pb-4 flex-shrink-0" style={{background:`linear-gradient(155deg,${kindColor} 0%,#0D6EFD 100%)`}}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={()=>setPhotoSheet(true)} className="relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 active:scale-95 transition-all" style={{background:"rgba(255,255,255,0.22)",border:"2px solid rgba(255,255,255,0.35)"}}>
              {currentPhoto?<img src={currentPhoto} alt="Logo" className="w-full h-full object-cover"/>:<Briefcase size={24} color="white"/>}
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg flex items-center justify-center" style={{background:"rgba(0,0,0,0.55)"}}><Camera size={10} color="white"/></div>
            </button>
            <div>
              <div className="flex items-center gap-2"><h1 className="text-base font-black text-white leading-tight">{emp.orgName}</h1><div className="w-4 h-4 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.25)"}}><Check size={9} color="white" strokeWidth={3}/></div></div>
              <p className="text-xs text-white/70">{MOCK_EMP.subRole} · {emp.addrCity}, {emp.addrState}</p>
              <Stars rating={MOCK_EMP.rating}/>
            </div>
          </div>
          <button onClick={()=>{setEditMode(!editMode);setSaved(false);setReviewMode(false)}} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95" style={{background:editMode?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.18)",color:editMode?kindColor:"white"}}>
            {editMode?<span className="text-base font-black leading-none">✕</span>:<Pencil size={16} color="white"/>}
          </button>
        </div>
        <div className="flex gap-2">
          {[{val:`${MOCK_EMP.rating}★`,lbl:"Rating"},{val:`${MOCK_EMP.reviewCount}`,lbl:"Reviews"},{val:`${MOCK_EMP.openPositions}`,lbl:"Open Roles"},{val:`${servicesSelected.size}`,lbl:"Services"}].map(({val,lbl})=>(
            <div key={lbl} className="flex-1 rounded-xl py-2 text-center" style={{background:"rgba(255,255,255,0.15)"}}><p className="text-sm font-black text-white">{val}</p><p className="text-[9px] text-white/65 font-semibold">{lbl}</p></div>
          ))}
        </div>
        <div className="flex mt-3 rounded-xl p-0.5 gap-0.5" style={{background:"rgba(0,0,0,0.2)"}}>
          {(["brief","detail"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{background:tab===t?"#fff":"transparent",color:tab===t?kindColor:"rgba(255,255,255,0.55)",boxShadow:tab===t?"0 2px 8px rgba(0,0,0,0.15)":"none"}}>
              {t==="brief"?"Brief Profile":"Full Profile"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {tab==="brief"?<motion.div key="brief" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}} className="absolute inset-0 overflow-y-auto px-6 py-4 space-y-4">
            <div className="flex flex-wrap gap-2">{["ID Verified","Org Registered","KYC Approved"].map(b=><div key={b} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border" style={{background:"#DCFCE7",borderColor:"#BBF7D0"}}><ShieldCheck size={11} color="#198754"/><span className="text-[11px] font-bold text-green-700">{b}</span></div>)}</div>
            <div className="grid grid-cols-2 gap-2">{[{lbl:"Organisation",val:emp.orgName},{lbl:"Type",val:MOCK_EMP.subRole},{lbl:"City",val:emp.addrCity},{lbl:"Contract",val:emp.contractType},{lbl:"Departments",val:emp.departments.split(",")[0]+"…"},{lbl:"Capacity",val:MOCK_EMP.bedCapacity}].map(({lbl,val})=><div key={lbl} className="bg-white rounded-2xl px-3 py-3 border" style={{borderColor:"#F3F4F6"}}><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lbl}</p><p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{val}</p></div>)}</div>
            <div className="bg-white rounded-2xl p-4 border" style={{borderColor:"#F3F4F6"}}><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Services Required ({servicesSelected.size})</p><div className="flex flex-wrap gap-1.5">{[...servicesSelected].slice(0,10).map(s=><span key={s} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{background:`${kindColor}10`,color:kindColor,border:`1px solid ${kindColor}30`}}>{s}</span>)}{servicesSelected.size>10&&<span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-gray-400" style={{background:"#F3F4F6"}}>+{servicesSelected.size-10} more</span>}</div></div>
            {emp.addrCity&&<a href={`https://maps.google.com/?q=${encodeURIComponent([emp.addrStreet,emp.addrLocality,emp.addrCity,emp.addrState,emp.addrPin].filter(Boolean).join(", "))}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl px-4 py-3 border no-underline" style={{background:"#E2F0FF",borderColor:"#BFDBFE",display:"flex"}}><Globe size={16} color="#0D6EFD"/><div className="flex-1"><p className="text-xs font-black text-blue-700">View on Google Maps</p><p className="text-[10px] text-blue-400">{[emp.addrLocality,emp.addrCity].filter(Boolean).join(", ")}</p></div><ChevronRight size={14} color="#93C5FD"/></a>}
          </motion.div>:<motion.div key="detail" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} transition={{duration:0.22}} className="absolute inset-0 overflow-y-auto px-6 py-4 space-y-5">
            <div>
              <SectionDivider label="Verified Identity" color="#0D6EFD"/>
              <div className="mt-3 rounded-2xl px-4 py-3 border flex items-start gap-2.5" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}>
                <Info size={14} color="#D97706" className="flex-shrink-0 mt-0.5"/>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Identity-Verified Fields</p><p className="text-xs text-amber-700 leading-relaxed">Email and Mobile cannot be self-edited.</p><button onClick={()=>setAdminField("identity")} className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-500"><Mail size={10}/> Request identity change</button></div>
              </div>
            </div>
            <div>
              <SectionDivider label="Organisation Details" color={kindColor}/>
              <div className="mt-3">
                {editMode?<div className="space-y-3">{[{lbl:"Organisation Name",k:"orgName"as const},{lbl:"Contact Person",k:"contactPerson"as const},{lbl:"Designation",k:"designation"as const},{lbl:"Departments",k:"departments"as const},{lbl:"Contract Type",k:"contractType"as const}].map(({lbl,k})=><div key={lbl}><FieldLabel>{lbl}</FieldLabel><TextInput value={emp[k]} onChange={v=>setEmp({...emp,[k]:v})} accent={emp[k]?kindColor:undefined}/></div>)}</div>
                :<div className="grid grid-cols-2 gap-2">{[{lbl:"Name",val:emp.orgName},{lbl:"Contact",val:emp.contactPerson},{lbl:"Designation",val:emp.designation},{lbl:"Departments",val:emp.departments},{lbl:"Contract",val:emp.contractType},{lbl:"Reg Number",val:MOCK_EMP.regNumber}].map(({lbl,val})=><div key={lbl} className="bg-white rounded-xl px-3 py-2.5 border" style={{borderColor:"#F3F4F6"}}><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lbl}</p><p className="text-xs font-bold text-gray-800 mt-0.5 truncate">{val}</p></div>)}</div>}
              </div>
            </div>
            <div>
              <SectionDivider label="Services Required" color="#D97706"/>
              <div className="mt-3">
                {editMode?<div className="space-y-2">{[{title:"Physical Personal Care (ADLs)",items:ADL_ITEMS,color:"#0D6EFD"},{title:"Medical Assistance (IADLs)",items:IADL_ITEMS,color:"#5C0F8B"},{title:"Clinical & Specialised",items:[...MEDICAL_LICENSED,...SPECIALIZED_ITEMS_EXTRA],color:"#D97706"},{title:"Non-Medical Support",items:NON_MEDICAL_SUPPORT,color:"#6B7280"}].map(({title,items,color})=>(
                  <div key={title} className="rounded-2xl border overflow-hidden" style={{borderColor:`${color}30`}}>
                    <div className="flex items-center justify-between px-4 py-2.5" style={{background:`${color}0F`}}><p className="text-xs font-black text-gray-800">{title}</p><span className="text-[10px] font-black rounded-full px-2 py-0.5" style={{color,background:`${color}18`}}>{items.filter(i=>servicesSelected.has(i)).length}/{items.length}</span></div>
                    <div className="bg-white px-3 py-1.5 divide-y divide-gray-50">{items.map(item=><button key={item} onClick={()=>toggleService(item)} className="flex items-center gap-3 w-full py-2 text-left"><div className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all" style={{background:servicesSelected.has(item)?color:"transparent",border:`2px solid ${servicesSelected.has(item)?color:"#D1D5DB"}`,borderRadius:5}}>{servicesSelected.has(item)&&<Check size={10} color="white" strokeWidth={3}/>}</div><span className="text-sm font-medium text-gray-700">{item}</span></button>)}</div>
                  </div>
                ))}</div>
                :<div className="flex flex-wrap gap-1.5">{[...servicesSelected].map(s=><span key={s} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{background:"#FFFBEB",color:"#D97706",border:"1px solid #FDE68A"}}>{s}</span>)}</div>}
              </div>
            </div>
            {editMode&&<div className="pb-2 space-y-3">
              <AnimatePresence mode="wait">
                {saved?<motion.div key="saved" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2" style={{background:"#DCFCE7"}}><Check size={17} color="#198754" strokeWidth={3}/><span className="font-black text-green-700">Profile Saved!</span></motion.div>
                :reviewMode?<motion.div key="review" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:0.22}} className="rounded-2xl border overflow-hidden" style={{borderColor:"#BFDBFE"}}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{background:"#E2F0FF"}}><div className="flex items-center gap-2"><Eye size={14} color="#0D6EFD"/><p className="text-xs font-black uppercase tracking-widest text-blue-600">Review Changes</p></div><button onClick={()=>setReviewMode(false)} className="text-[10px] font-bold text-blue-400 flex items-center gap-1"><RotateCcw size={10}/> Edit more</button></div>
                  <div className="bg-white px-4 py-3 space-y-2.5">{[{lbl:"Org Name",orig:MOCK_EMP.orgName,curr:emp.orgName},{lbl:"Contact",orig:MOCK_EMP.contactPerson,curr:emp.contactPerson},{lbl:"City",orig:MOCK_EMP.addrCity,curr:emp.addrCity},{lbl:"Services",orig:`${14} selected`,curr:`${servicesSelected.size} selected`}].map(({lbl,orig,curr})=>{const changed=orig!==curr;return(<div key={lbl} className="flex items-center justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-20 flex-shrink-0">{lbl}</span><div className="flex items-center gap-2 flex-1 justify-end">{changed&&<span className="text-xs text-gray-300 line-through">{orig}</span>}<span className="text-xs font-bold rounded-full px-2 py-0.5" style={{color:changed?"#198754":"#6B7280",background:changed?"#DCFCE7":"#F3F4F6"}}>{curr}</span>{changed&&<Check size={10} color="#198754" strokeWidth={3}/>}</div></div>)})}</div>
                  <div className="px-4 py-3 flex gap-2" style={{background:"#F8F9FA"}}><button onClick={()=>setReviewMode(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-sm text-gray-500" style={{borderColor:"#E5E7EB"}}>← Go Back</button><button onClick={handleSave} className="flex-[2] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#198754,#0D6EFD)",color:"#fff"}}><Save size={14}/> Confirm Save</button></div>
                </motion.div>
                :<motion.div key="review-btn" className="flex gap-2"><button onClick={()=>setEditMode(false)} className="flex-1 py-3.5 rounded-2xl border font-bold text-sm text-gray-500" style={{borderColor:"#E5E7EB"}}>Discard</button><button onClick={()=>setReviewMode(true)} className="flex-[2] py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:`linear-gradient(135deg,${kindColor},#0D6EFD)`,color:"#fff",boxShadow:"0 4px 16px rgba(13,110,253,0.25)"}}><Eye size={15}/> Review Changes</button></motion.div>}
              </AnimatePresence>
            </div>}
            <div className="h-4"/>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Care Provider Welcome Back
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PROFILE = {
  firstName:"Arnab",lastName:"Khasnobis",email:"khasnobis.in@gmail.com",phone:"+91 9967011101",
  dob:"15 March 1985",age:40,gender:"Male",role:"Caregiver",city:"Mumbai",state:"Maharashtra",
  locality:"Bandra West",rate:"₹1,150",rateLabel:"Market Average Tier",
  rating:4.9,reviewCount:47,responseRate:98,activitiesCount:12,yearsExp:6,
  education:"Bachelor's Degree",
  profQuals:["B.Sc Nursing","Certificate in Care Giving","First Aid & CPR Certificate"],
  languages:[{lang:"Hindi",speak:true,read:true,write:true},{lang:"English",speak:true,read:true,write:true},{lang:"Bengali",speak:true,read:false,write:false}],
  workEnv:["Home Health Care","Hospital Care","Hospice"],
  activities:["Bed Mobility","Ambulation","Bathing","Dressing","Toileting","Assisted Feeding","Vital Signs","Medication Reminders","Housekeeping","Cognitive Engagement","Emergency Response","IoT Monitoring"],
  badges:["ID Verified","Background Checked","Guardrail Active"],
};

function LockedField({ label,value,onRequestChange }: { label:string;value:string;onRequestChange:()=>void }) {
  return (
    <div className="rounded-2xl border px-4 py-3" style={{background:"#F9FAFB",borderColor:"#E5E7EB"}}>
      <div className="flex items-center justify-between mb-1"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p><div className="flex items-center gap-1"><Lock size={9} color="#9CA3AF"/><span className="text-[9px] font-bold text-gray-400">Locked</span></div></div>
      <p className="text-sm font-bold text-gray-700 mb-1.5">{value}</p>
      <button onClick={onRequestChange} className="text-[11px] font-bold text-blue-500 hover:underline flex items-center gap-1"><Mail size={10}/> Request change via Admin</button>
    </div>
  );
}

function EditField({ label,value,onChange }: { label:string;value:string;onChange:(v:string)=>void }) {
  return (<div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">{label}</p><input type="text" value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none transition-all" style={{borderColor:value?"#0D6EFD":"#E5E7EB"}}/></div>);
}

function ScreenWelcomeBack({ profilePhoto:initPhoto="" }: { profilePhoto?:string }) {
  const [tab,setTab]=useState<"brief"|"detail">("brief");
  const [editMode,setEditMode]=useState(false);
  const [saved,setSaved]=useState(false);
  const [reviewMode,setReviewMode]=useState(false);
  const [adminField,setAdminField]=useState<"email"|"phone"|"identity"|null>(null);
  const [adminReason,setAdminReason]=useState("");
  const [adminSent,setAdminSent]=useState(false);
  const [currentPhoto,setCurrentPhoto]=useState(initPhoto);
  const [photoSheet,setPhotoSheet]=useState(false);
  const [pendingPhoto,setPendingPhoto]=useState<string|null>(null);
  const [photoSubmitted,setPhotoSubmitted]=useState(false);
  const photoChangeRef=useRef<HTMLInputElement>(null);
  const [selectedActivities,setSelectedActivities]=useState<Set<string>>(new Set(MOCK_PROFILE.activities));
  function toggleActivity(act:string){setSelectedActivities(prev=>{const next=new Set(prev);next.has(act)?next.delete(act):next.add(act);return next})}
  const [prof,setProf]=useState({firstName:MOCK_PROFILE.firstName,lastName:MOCK_PROFILE.lastName,dob:MOCK_PROFILE.dob,gender:MOCK_PROFILE.gender,role:MOCK_PROFILE.role,city:MOCK_PROFILE.city,state:MOCK_PROFILE.state,locality:MOCK_PROFILE.locality,rate:MOCK_PROFILE.rate,education:MOCK_PROFILE.education});
  function handleSave(){setSaved(true);setTimeout(()=>{setSaved(false);setEditMode(false);setReviewMode(false)},1800)}
  const fullName=`${prof.firstName} ${prof.lastName}`.trim();
  return (
    <div className="flex flex-col h-full relative">
      <input ref={photoChangeRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)setPendingPhoto(URL.createObjectURL(f))}}/>
      <AnimatePresence>
        {photoSheet&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.45)"}} onClick={()=>{if(!photoSubmitted){setPhotoSheet(false);setPendingPhoto(null)}}}>
          <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:300}} className="rounded-t-3xl p-6 space-y-4 bg-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-2"/>
            {photoSubmitted?<div className="flex flex-col items-center gap-3 py-4"><div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"#DCFCE7"}}><Check size={26} color="#198754" strokeWidth={3}/></div><p className="font-black text-gray-900 text-base">Request Submitted</p><p className="text-sm text-gray-500 text-center">Photo verified within <span className="font-black text-purple-700">3 working days</span>.</p></div>
            :<><p className="font-black text-gray-900 text-base">Change Profile Photo</p><div className="flex items-start gap-2 rounded-xl px-3 py-3 border" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}><Info size={13} color="#D97706" className="flex-shrink-0 mt-0.5"/><p className="text-xs font-semibold text-amber-700">Photo must match your National ID. Changes take up to <span className="font-black">3 working days</span>.</p></div>
            {!pendingPhoto?<button onClick={()=>photoChangeRef.current?.click()} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed" style={{borderColor:"#BFDBFE",color:"#0D6EFD",background:"#F0F7FF"}}><Camera size={15}/> Select New Photo</button>
            :<button onClick={()=>{setCurrentPhoto(pendingPhoto!);setPhotoSubmitted(true);setTimeout(()=>{setPhotoSheet(false);setPendingPhoto(null);setPhotoSubmitted(false)},2800)}} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)",color:"#fff"}}><ShieldCheck size={15}/> Submit for Verification</button>}
            <button onClick={()=>{setPhotoSheet(false);setPendingPhoto(null)}} className="w-full py-2 text-xs font-semibold text-gray-400">Cancel</button></>}
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
      <AnimatePresence>
        {adminField&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.45)"}} onClick={()=>!adminSent&&setAdminField(null)}>
          <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:300}} className="rounded-t-3xl p-6 space-y-4 bg-white" onClick={e=>e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-2"/>
            {adminSent?<div className="flex flex-col items-center gap-3 py-4"><div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"#DCFCE7"}}><Check size={28} color="#198754" strokeWidth={3}/></div><p className="font-black text-gray-900">Request Sent!</p><p className="text-sm text-gray-500 text-center">Admin will respond within 2–3 business days.</p></div>
            :<><p className="font-black text-gray-900 text-base">{adminField==="identity"?"Request Identity Data Change":`Request ${adminField==="email"?"Email":"Mobile Number"} Change`}</p><p className="text-xs text-gray-500 leading-relaxed">Verified identity fields cannot be self-edited. State your reason below.</p><textarea value={adminReason} onChange={e=>setAdminReason(e.target.value)} rows={3} placeholder="Reason for change…" className="w-full rounded-2xl px-4 py-3 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none resize-none placeholder:text-gray-300" style={{borderColor:adminReason?"#0D6EFD":"#E5E7EB"}}/><button onClick={()=>{if(!adminReason.trim())return;setAdminSent(true);setTimeout(()=>{setAdminSent(false);setAdminField(null);setAdminReason("")},2500)}} disabled={!adminReason.trim()} className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:adminReason.trim()?"linear-gradient(135deg,#5C0F8B,#0D6EFD)":"#E5E7EB",color:adminReason.trim()?"#fff":"#9CA3AF"}}><Mail size={15}/> Send Request to Admin</button></>}
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
      <div className="px-6 pt-7 pb-4 flex-shrink-0" style={{background:"linear-gradient(155deg,#198754 0%,#0D6EFD 100%)"}}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={()=>setPhotoSheet(true)} className="relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 active:scale-95 transition-all" style={{background:"rgba(255,255,255,0.22)",border:"2px solid rgba(255,255,255,0.35)"}}>
              {currentPhoto?<img src={currentPhoto} alt="Profile" className="w-full h-full object-cover"/>:<User size={26} color="white"/>}
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg flex items-center justify-center" style={{background:"rgba(0,0,0,0.55)"}}><Camera size={10} color="white"/></div>
            </button>
            <div>
              <div className="flex items-center gap-2"><h1 className="text-lg font-black text-white leading-tight">{fullName}</h1><div className="w-4 h-4 rounded-full flex items-center justify-center" style={{background:"rgba(255,255,255,0.25)"}}><Check size={9} color="white" strokeWidth={3}/></div></div>
              <p className="text-xs text-white/70">{prof.role} · {prof.city}, {prof.state}</p>
              <Stars rating={MOCK_PROFILE.rating}/>
            </div>
          </div>
          <button onClick={()=>{setEditMode(!editMode);setSaved(false);setReviewMode(false)}} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95" title={editMode?"Cancel editing":"Edit profile"} style={{background:editMode?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.18)",color:editMode?"#5C0F8B":"white",boxShadow:editMode?"0 2px 8px rgba(92,15,139,0.18)":"none"}}>
            {editMode?<span className="text-base font-black leading-none">✕</span>:<Pencil size={16} color="white"/>}
          </button>
        </div>
        <div className="flex gap-2">
          {[{val:`${MOCK_PROFILE.rating}★`,lbl:"Rating"},{val:`${MOCK_PROFILE.reviewCount}`,lbl:"Reviews"},{val:`${MOCK_PROFILE.responseRate}%`,lbl:"Response"},{val:`${MOCK_PROFILE.activitiesCount}`,lbl:"Skills"}].map(({val,lbl})=>(
            <div key={lbl} className="flex-1 rounded-xl py-2 text-center" style={{background:"rgba(255,255,255,0.15)"}}><p className="text-sm font-black text-white">{val}</p><p className="text-[9px] text-white/65 font-semibold">{lbl}</p></div>
          ))}
        </div>
        <div className="flex mt-3 rounded-xl p-0.5 gap-0.5" style={{background:"rgba(0,0,0,0.2)"}}>
          {(["brief","detail"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{background:tab===t?"#fff":"transparent",color:tab===t?"#198754":"rgba(255,255,255,0.55)",boxShadow:tab===t?"0 2px 8px rgba(0,0,0,0.15)":"none"}}>
              {t==="brief"?"Brief Profile":"Full Profile"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {tab==="brief"?<motion.div key="brief" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.22}} className="absolute inset-0 overflow-y-auto px-6 py-4 space-y-4">
            <div className="flex flex-wrap gap-2">{MOCK_PROFILE.badges.map(b=><div key={b} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border" style={{background:"#DCFCE7",borderColor:"#BBF7D0"}}><ShieldCheck size={11} color="#198754"/><span className="text-[11px] font-bold text-green-700">{b}</span></div>)}</div>
            <div className="rounded-2xl p-4 border flex items-center justify-between" style={{background:"#E2F0FF",borderColor:"#BFDBFE"}}><div><p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Daily Rate</p><p className="text-3xl font-black text-blue-700">{prof.rate}<span className="text-base font-bold text-blue-400"> / day</span></p><p className="text-xs text-blue-500 font-semibold mt-0.5">{MOCK_PROFILE.rateLabel}</p></div><div className="text-right"><ShieldCheck size={32} color="#0D6EFD"/><p className="text-[10px] font-bold text-blue-400 mt-1">Guardrail Active</p></div></div>
            <div className="grid grid-cols-2 gap-2">{[{lbl:"Role",val:prof.role},{lbl:"Experience",val:`${MOCK_PROFILE.yearsExp} years`},{lbl:"Education",val:prof.education},{lbl:"Location",val:`${prof.city}, ${prof.state}`},{lbl:"Gender",val:prof.gender},{lbl:"Age",val:`${MOCK_PROFILE.age} yrs`}].map(({lbl,val})=><div key={lbl} className="bg-white rounded-2xl px-3 py-3 border" style={{borderColor:"#F3F4F6"}}><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lbl}</p><p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p></div>)}</div>
            <div className="bg-white rounded-2xl p-4 border" style={{borderColor:"#F3F4F6"}}><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Languages</p><div className="space-y-2">{MOCK_PROFILE.languages.map(({lang,speak,read,write})=><div key={lang} className="flex items-center justify-between"><span className="text-sm font-bold text-gray-700">{lang}</span><div className="flex gap-1">{[{lbl:"S",active:speak},{lbl:"R",active:read},{lbl:"W",active:write}].map(({lbl,active})=><span key={lbl} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black" style={{background:active?"#0D6EFD":"#F3F4F6",color:active?"#fff":"#D1D5DB"}}>{lbl}</span>)}</div></div>)}</div></div>
            <div className="bg-white rounded-2xl p-4 border" style={{borderColor:"#F3F4F6"}}><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Work Environments</p><div className="flex flex-wrap gap-2">{MOCK_PROFILE.workEnv.map(e=><span key={e} className="rounded-full px-3 py-1 text-xs font-bold" style={{background:"#F5F0FF",color:"#5C0F8B"}}>{e}</span>)}</div></div>
          </motion.div>:<motion.div key="detail" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} transition={{duration:0.22}} className="absolute inset-0 overflow-y-auto px-6 py-4 space-y-5">
            <div>
              <SectionDivider label="Personal Details" color="#0D6EFD"/>
              <div className="space-y-3 mt-3">
                <div className="rounded-2xl px-4 py-3 border flex items-start gap-2.5" style={{background:"#FFF7ED",borderColor:"#FED7AA"}}><Info size={14} color="#D97706" className="flex-shrink-0 mt-0.5"/><div><p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Identity-Verified Fields</p><p className="text-xs text-amber-700 leading-relaxed">Name, DOB, Gender, Email and Mobile are bound to your verified ID.</p><button onClick={()=>setAdminField("identity")} className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-500"><Mail size={10}/> Request identity change</button></div></div>
                <div className="grid grid-cols-2 gap-2">{[{lbl:"First Name",val:prof.firstName},{lbl:"Last Name",val:prof.lastName},{lbl:"Date of Birth",val:prof.dob},{lbl:"Gender",val:prof.gender},{lbl:"Age",val:`${MOCK_PROFILE.age} yrs`}].map(({lbl,val})=><div key={lbl} className="bg-white rounded-xl px-3 py-2.5 border relative" style={{borderColor:"#F3F4F6"}}><div className="flex items-center justify-between mb-0.5"><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lbl}</p><Lock size={8} color="#D1D5DB"/></div><p className="text-sm font-bold text-gray-800">{val}</p></div>)}</div>
              </div>
            </div>
            <div>
              <SectionDivider label="Professional Background" color="#5C0F8B"/>
              <div className="space-y-3 mt-3">
                {editMode?<><EditField label="Role / Profession" value={prof.role} onChange={v=>setProf({...prof,role:v})}/><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Education</p><div className="relative"><select value={prof.education} onChange={e=>setProf({...prof,education:e.target.value})} className="w-full appearance-none rounded-xl px-3 py-2.5 pr-8 text-sm font-medium bg-white border-2 text-gray-800 focus:outline-none" style={{borderColor:"#5C0F8B"}}>{EDUCATION_OPTIONS_NEW.map(e=><option key={e}>{e}</option>)}</select><ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/></div></div></>
                :<div className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{lbl:"Role",val:prof.role},{lbl:"Education",val:prof.education},{lbl:"Experience",val:`${MOCK_PROFILE.yearsExp} yrs`},{lbl:"Qualifications",val:`${MOCK_PROFILE.profQuals.length} certificates`}].map(({lbl,val})=><div key={lbl} className="bg-white rounded-xl px-3 py-2.5 border" style={{borderColor:"#F3F4F6"}}><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lbl}</p><p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p></div>)}</div></div>}
              </div>
            </div>
            <div>
              <SectionDivider label="Deployment Location" color="#198754"/>
              <div className="space-y-3 mt-3">
                {editMode?<div className="grid grid-cols-2 gap-3"><EditField label="City" value={prof.city} onChange={v=>setProf({...prof,city:v})}/><EditField label="State" value={prof.state} onChange={v=>setProf({...prof,state:v})}/><EditField label="Locality" value={prof.locality} onChange={v=>setProf({...prof,locality:v})}/><EditField label="Daily Rate" value={prof.rate} onChange={v=>setProf({...prof,rate:v})}/></div>
                :<div className="grid grid-cols-2 gap-2">{[{lbl:"City",val:prof.city},{lbl:"State",val:prof.state},{lbl:"Locality",val:prof.locality},{lbl:"Daily Rate",val:`${prof.rate}/day`}].map(({lbl,val})=><div key={lbl} className="bg-white rounded-xl px-3 py-2.5 border" style={{borderColor:"#F3F4F6"}}><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{lbl}</p><p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p></div>)}</div>}
              </div>
            </div>
            <div>
              <SectionDivider label="Care Activities" color="#D97706"/>
              {editMode?<div className="mt-3 space-y-3">{[{title:"Physical Personal Care (ADLs)",items:ADL_ITEMS,color:"#0D6EFD",bg:"#E2F0FF"},{title:"Medical Assistance (IADLs)",items:IADL_ITEMS,color:"#5C0F8B",bg:"#F5F0FF"},{title:"Specialised & Emergency",items:SPECIALIZED_ITEMS_EXTRA,color:"#198754",bg:"#DCFCE7"},{title:"Clinical Care (Licensed)",items:MEDICAL_LICENSED,color:"#D97706",bg:"#FFFBEB"},{title:"Non-Medical Support",items:NON_MEDICAL_SUPPORT,color:"#6B7280",bg:"#F3F4F6"}].map(({title,items,color,bg})=>{const count=items.filter(i=>selectedActivities.has(i)).length;return(<div key={title} className="rounded-2xl border overflow-hidden" style={{borderColor:`${color}30`}}><div className="flex items-center justify-between px-4 py-2.5" style={{background:bg}}><p className="text-xs font-black text-gray-800">{title}</p><span className="text-[10px] font-black rounded-full px-2 py-0.5" style={{color,background:`${color}18`}}>{count}/{items.length}</span></div><div className="bg-white px-3 py-1.5 divide-y divide-gray-50">{items.map(item=><button key={item} onClick={()=>toggleActivity(item)} className="flex items-center gap-3 w-full py-2 text-left transition-colors active:bg-gray-50"><div className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all" style={{width:18,height:18,background:selectedActivities.has(item)?color:"transparent",border:`2px solid ${selectedActivities.has(item)?color:"#D1D5DB"}`,borderRadius:5}}>{selectedActivities.has(item)&&<Check size={10} color="white" strokeWidth={3}/>}</div><span className="text-sm font-medium text-gray-700">{item}</span></button>)}</div></div>)})}<p className="text-[10px] text-gray-400 text-center pb-1">{selectedActivities.size} activit{selectedActivities.size===1?"y":"ies"} selected</p></div>
              :<div className="mt-3 flex flex-wrap gap-1.5">{[...selectedActivities].map(a=><span key={a} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{background:"#FFFBEB",color:"#D97706",border:"1px solid #FDE68A"}}>{a}</span>)}{selectedActivities.size===0&&<p className="text-xs text-gray-400 italic">No activities selected</p>}</div>}
            </div>
            {editMode&&<div className="pb-2 space-y-3">
              <AnimatePresence mode="wait">
                {saved?<motion.div key="saved" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2" style={{background:"#DCFCE7"}}><Check size={17} color="#198754" strokeWidth={3}/><span className="font-black text-green-700">Profile Saved!</span></motion.div>
                :reviewMode?<motion.div key="review" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:0.22}} className="rounded-2xl border overflow-hidden" style={{borderColor:"#BFDBFE"}}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{background:"#E2F0FF"}}><div className="flex items-center gap-2"><Eye size={14} color="#0D6EFD"/><p className="text-xs font-black uppercase tracking-widest text-blue-600">Review Changes</p></div><button onClick={()=>setReviewMode(false)} className="text-[10px] font-bold text-blue-400 flex items-center gap-1"><RotateCcw size={10}/> Edit more</button></div>
                  <div className="bg-white px-4 py-3 space-y-2.5">{[{lbl:"First Name",orig:MOCK_PROFILE.firstName,curr:prof.firstName},{lbl:"Last Name",orig:MOCK_PROFILE.lastName,curr:prof.lastName},{lbl:"Role",orig:MOCK_PROFILE.role,curr:prof.role},{lbl:"Education",orig:MOCK_PROFILE.education,curr:prof.education},{lbl:"City",orig:MOCK_PROFILE.city,curr:prof.city},{lbl:"State",orig:MOCK_PROFILE.state,curr:prof.state},{lbl:"Locality",orig:MOCK_PROFILE.locality,curr:prof.locality},{lbl:"Daily Rate",orig:MOCK_PROFILE.rate,curr:prof.rate},{lbl:"Activities",orig:`${MOCK_PROFILE.activities.length} selected`,curr:`${selectedActivities.size} selected`}].map(({lbl,orig,curr})=>{const changed=orig!==curr;return(<div key={lbl} className="flex items-start justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-20 flex-shrink-0 pt-0.5">{lbl}</span><div className="flex items-center gap-2 flex-1 justify-end">{changed&&<span className="text-xs text-gray-300 line-through">{orig}</span>}<span className="text-xs font-bold rounded-full px-2 py-0.5" style={{color:changed?"#198754":"#6B7280",background:changed?"#DCFCE7":"#F3F4F6"}}>{curr}</span>{changed&&<Check size={10} color="#198754" strokeWidth={3}/>}</div></div>)})}</div>
                  <div className="px-4 py-3 flex gap-2" style={{background:"#F8F9FA"}}><button onClick={()=>setReviewMode(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-sm text-gray-500" style={{borderColor:"#E5E7EB"}}>← Go Back</button><button onClick={handleSave} className="flex-[2] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#198754,#0D6EFD)",color:"#fff"}}><Save size={14}/> Confirm Save</button></div>
                </motion.div>
                :<motion.div key="review-btn" className="flex gap-2"><button onClick={()=>setEditMode(false)} className="flex-1 py-3.5 rounded-2xl border font-bold text-sm text-gray-500" style={{borderColor:"#E5E7EB"}}>Discard</button><button onClick={()=>setReviewMode(true)} className="flex-[2] py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{background:"linear-gradient(135deg,#5C0F8B,#0D6EFD)",color:"#fff",boxShadow:"0 4px 16px rgba(13,110,253,0.25)"}}><Eye size={15}/> Review Changes</button></motion.div>}
              </AnimatePresence>
            </div>}
            <div className="h-4"/>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide transition
// ─────────────────────────────────────────────────────────────────────────────

const SLIDE = {
  enter:(d:number)=>({x:d>0?"100%":"-100%",opacity:0}),
  center:{x:0,opacity:1},
  exit:(d:number)=>({x:d>0?"-100%":"100%",opacity:0}),
};

// ─────────────────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,setScreen]=useState(0);
  const [direction,setDirection]=useState(1);
  const [userCategory,setUserCategory]=useState<"provider"|"employer"|null>(null);
  const [userSubRole,setUserSubRole]=useState("");
  const [signupEmail,setSignupEmail]=useState("");
  const [signupPhone,setSignupPhone]=useState("");
  const [personal,setPersonal]=useState<PersonalDetails>({firstName:"",lastName:"",dob:"",gender:"",nationalSkills:Object.fromEntries(INDIA_NATIONAL_LANGS.map(l=>[l,{...BLANK_SKILLS}])),regionalLangs:[],foreignLangs:[]});
  const [professional,setProfessional]=useState<ProfessionalDetails>({education:"",eduCertFile:"",profQuals:[],profQualOther:"",profCertFiles:[],vocationalCerts:[{name:"",fileName:""},{name:"",fileName:""},{name:"",fileName:""}]});
  const [capabilities,setCapabilities]=useState<CapabilitiesState>({sectionA:Object.fromEntries([...ADL_ITEMS,...IADL_ITEMS,...MEDICAL_LICENSED].map(k=>[k,false])),sectionB:Object.fromEntries(NON_MEDICAL_SUPPORT.map(k=>[k,false]))});
  const [salary,setSalary]=useState<SalaryTier>("recommended");
  const [profilePhoto,setProfilePhoto]=useState<string>("");
  const [employerDetails,setEmployerDetails]=useState<EmployerDetails>({...BLANK_EMPLOYER});
  const [employerServices,setEmployerServices]=useState<EmployerServicesState>({sectionA:Object.fromEntries([...ADL_ITEMS,...IADL_ITEMS,...MEDICAL_LICENSED,...SPECIALIZED_ITEMS_EXTRA].map(k=>[k,false])),sectionB:Object.fromEntries(NON_MEDICAL_SUPPORT.map(k=>[k,false]))});

  function goTo(n:number){setDirection(n>screen?1:-1);setScreen(n)}

  const screens=[
    /*0*/<ScreenSplash key="splash" onDone={()=>goTo(1)}/>,
    /*1*/<ScreenRoleSelect key="role" onContinue={(cat,role)=>{setUserCategory(cat);setUserSubRole(role);goTo(2)}}/>,
    /*2*/<ScreenAuth key="auth" onBack={()=>goTo(1)} onLogin={()=>goTo(3)} onSignUp={(email,phone)=>{setSignupEmail(email);setSignupPhone(phone);goTo(4)}}/>,
    /*3*/userCategory==="employer"?<ScreenEmployerWelcomeBack key="ewb" profilePhoto={profilePhoto}/>:<ScreenWelcomeBack key="wb" profilePhoto={profilePhoto}/>,
    /*4*/<ScreenOTP key="otp" signupEmail={signupEmail} signupPhone={signupPhone} onNext={()=>userCategory==="employer"?goTo(11):goTo(5)} onBack={()=>goTo(2)}/>,
    /*5*/<ScreenCVUpload key="cv" onApply={()=>goTo(6)} onSkip={()=>goTo(6)} onBack={()=>goTo(4)}/>,
    /*6*/<ProfileStep1 key="p1" data={personal} setData={setPersonal} email={signupEmail} phone={signupPhone} onNext={()=>goTo(7)} onBack={()=>goTo(5)}/>,
    /*7*/<ProfileStep2 key="p2" data={professional} setData={setProfessional} onNext={()=>goTo(8)} onBack={()=>goTo(6)}/>,
    /*8*/<ProfileStep3 key="p3" data={capabilities} setData={setCapabilities} onNext={()=>goTo(9)} onBack={()=>goTo(7)}/>,
    /*9*/<ScreenSalary key="sal" personalData={personal} salary={salary} setSalary={setSalary} onComplete={()=>goTo(10)} onBack={()=>goTo(8)}/>,
    /*10*/<ScreenProfilePhoto key="photo" name={[personal.firstName,personal.lastName].filter(Boolean).join(" ")} onDone={url=>{setProfilePhoto(url);goTo(3)}} onBack={()=>goTo(9)}/>,
    /*11*/<ScreenEmployerStep1 key="emp1" data={employerDetails} setData={setEmployerDetails} kind={getEmployerKind(userSubRole)} subRole={userSubRole} email={signupEmail} phone={signupPhone} onNext={()=>goTo(12)} onBack={()=>goTo(4)}/>,
    /*12*/<ScreenEmployerStep2 key="emp2" data={employerServices} setData={setEmployerServices} kind={getEmployerKind(userSubRole)} onNext={()=>goTo(13)} onBack={()=>goTo(11)}/>,
    /*13*/<ScreenProfilePhoto key="empphoto" name={employerDetails.orgName||[employerDetails.firstName,employerDetails.lastName].filter(Boolean).join(" ")||"Employer"} onDone={url=>{setProfilePhoto(url);goTo(3)}} onBack={()=>goTo(12)}/>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#000",fontFamily:"'Inter', sans-serif"}}>
      <div className="relative overflow-hidden bg-background" style={{width:393,height:852,borderRadius:44,boxShadow:"0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.05)"}}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-8 pt-3 pb-1" style={{background:"#5C0F8B"}}>
          <span className="text-xs font-bold text-white">9:41</span>
          <div className="w-24 h-6 rounded-full bg-black"/>
          <div className="flex gap-1.5 items-center">
            <div className="flex gap-0.5 items-end h-3">{[2,3,4,5].map((h,i)=><div key={i} className="w-1 rounded-sm" style={{height:h*2.5,background:"white",opacity:i<3?1:0.3}}/>)}</div>
            <span className="text-[10px] text-white font-medium">5G</span>
            <div className="rounded-sm border border-white/60 h-3 w-5 flex items-center px-0.5"><div className="bg-white h-2 w-3.5 rounded-sm"/></div>
          </div>
        </div>
        {/* Screen */}
        <div className="relative overflow-hidden" style={{height:810}}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div key={screen} custom={direction} variants={SLIDE} initial="enter" animate="center" exit="exit"
              transition={{duration:0.3,ease:[0.25,0.46,0.45,0.94]}} className="absolute inset-0 flex flex-col"
              style={{background:screen<=1?"#5C0F8B":"#F8F9FA"}}>
              {screens[screen]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
