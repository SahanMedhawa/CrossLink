import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { signup } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SKILL_OPTIONS, INTEREST_OPTIONS } from "../../constants/skillsAndInterests";

/* ─── Validation per step ─── */
const stepTwoSchema = Yup.object({
  name: Yup.string().min(2, "Too short").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Min 6 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords don't match")
    .required("Required"),
});

const ngoStepThreeSchema = Yup.object({
  organizationName: Yup.string().required("Required"),
  website: Yup.string().url("Invalid URL"),
});

const corpStepThreeSchema = Yup.object({
  companyName: Yup.string().required("Required"),
});

/* ─── Shared input class helper ─── */
const inputCls = (hasError) =>
  `w-full px-4 py-3 rounded-xl border bg-gray-50/60 text-sm placeholder:text-gray-400 transition-all duration-200 outline-none
   focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
   ${hasError ? "border-red-300 bg-red-50/60" : "border-gray-200"}`;

/* ─── Role meta ─── */
const roles = [
  {
    id: "volunteer",
    emoji: "🙋",
    label: "Volunteer",
    tag: "I want to help",
    desc: "Lend your skills to meaningful projects",
    color: "blue",
  },
  {
    id: "ngo",
    emoji: "🌍",
    label: "NGO",
    tag: "I need volunteers",
    desc: "Find passionate people for your cause",
    color: "emerald",
  },
  {
    id: "corporate",
    emoji: "🏢",
    label: "Corporate",
    tag: "CSR Partner",
    desc: "Drive social impact through partnerships",
    color: "violet",
  },
];

const colorMap = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-400",   ring: "ring-blue-400/30",   text: "text-blue-700",    btn: "bg-blue-600 hover:bg-blue-700",    dot: "bg-blue-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-400",ring: "ring-emerald-400/30",text: "text-emerald-700", btn: "bg-emerald-600 hover:bg-emerald-700",dot: "bg-emerald-500" },
  violet:  { bg: "bg-violet-50",  border: "border-violet-400", ring: "ring-violet-400/30", text: "text-violet-700",  btn: "bg-violet-600 hover:bg-violet-700", dot: "bg-violet-500" },
};

const Register = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1);           // 1 = role, 2 = basics, 3 = extras
  const [userType, setUserType] = useState("volunteer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: "" });

  const accent = colorMap[roles.find((r) => r.id === userType)?.color || "blue"];

  /* ─── Form values ─── */
  const [formValues, setFormValues] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", location: "",
    skills: [], interests: [],
    customSkillInput: "", customInterestInput: "",
    organizationName: "", focusAreas: "", website: "",
    companyName: "", industry: "", csrInterests: "",
  });

  /* ─── Step navigation ─── */
  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => { setSubmitStatus({ type: null, message: "" }); setStep((s) => Math.max(s - 1, 1)); };

  /* ─── Submit to API ─── */
  const handleFinalSubmit = async (values) => {
    // Merge Formik values into state, but preserve skills/interests
    // from React state (tag toggles update formValues, not Formik)
    const merged = { ...formValues, ...values, skills: formValues.skills, interests: formValues.interests };
    setFormValues(merged);
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const data = {
        name: merged.name, email: merged.email, password: merged.password,
        role: userType,
        phone: merged.phone || undefined,
        location: merged.location || undefined,
      };
      if (userType === "volunteer") {
        data.skills = merged.skills || [];
        data.interests = merged.interests || [];
      } else if (userType === "ngo") {
        data.organizationName = merged.organizationName;
        data.focusAreas = merged.focusAreas ? merged.focusAreas.split(",").map((s) => s.trim()) : [];
        data.website = merged.website || undefined;
      } else if (userType === "corporate") {
        data.companyName = merged.companyName;
        data.industry = merged.industry || undefined;
        data.csrInterests = merged.csrInterests ? merged.csrInterests.split(",").map((s) => s.trim()) : [];
      }

      const response = await signup(data);
      if (response.success && response.data) {
        setSubmitStatus({ type: "success", message: `Welcome to CrossLink, ${response.data.user.name}! 🎉` });
        authLogin(response.data.user, response.data.token);
        setTimeout(() => navigate(response.data.redirectPath), 1200);
      }
    } catch (error) {
      setSubmitStatus({ type: "error", message: error.message || "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Step indicator ─── */
  const StepBar = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <button
            type="button"
            onClick={() => s < step && setStep(s)}
            className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300
              ${s === step ? `${accent.btn} text-white scale-110 shadow-lg` : ""}
              ${s < step ? `${accent.dot} text-white cursor-pointer hover:scale-105` : ""}
              ${s > step ? "bg-gray-200 text-gray-400 cursor-default" : ""}
            `}
          >
            {s < step ? "✓" : s}
          </button>
          {s < 3 && (
            <div className={`w-12 h-0.5 rounded transition-colors duration-300 ${s < step ? accent.dot : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  /* ─── Step labels ─── */
  const stepLabels = ["Choose your role", "Create your account", "Almost there!"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4 sm:p-6">
      {/* Card */}
      <div className="w-full max-w-lg">
        {/* Logo + back to home */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-gray-800">CrossLink</span>
          </Link>
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {/* Inner padding */}
          <div className="px-6 sm:px-10 pt-8 pb-10">
            {/* Step bar */}
            <StepBar />

            {/* Step title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {stepLabels[step - 1]}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {step === 1 && "Pick the role that fits you best"}
                {step === 2 && "We just need a few basics"}
                {step === 3 && "Optional details to personalise your profile"}
              </p>
            </div>

            {/* Status message */}
            {submitStatus.type && (
              <div className={`flex items-center gap-2 p-3.5 rounded-xl mb-6 text-sm font-medium
                ${submitStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                <span>{submitStatus.type === "success" ? "✅" : "⚠️"}</span>
                <span>{submitStatus.message}</span>
              </div>
            )}

            {/* ════════════ STEP 1 — Role select ════════════ */}
            {step === 1 && (
              <div className="space-y-3">
                {roles.map((role) => {
                  const c = colorMap[role.color];
                  const active = userType === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setUserType(role.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group
                        ${active ? `${c.border} ${c.bg} ring-4 ${c.ring} scale-[1.02]` : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                    >
                      <span className="text-3xl">{role.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${active ? c.text : "text-gray-800"}`}>{role.label}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${active ? `${c.bg} ${c.text}` : "bg-gray-100 text-gray-500"}`}>
                            {role.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${active ? `${c.border} ${c.bg}` : "border-gray-300"}`}>
                        {active && <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />}
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={goNext}
                  className={`w-full mt-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 ${accent.btn}`}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ════════════ STEP 2 — Basic info ════════════ */}
            {step === 2 && (
              <Formik
                initialValues={formValues}
                validationSchema={stepTwoSchema}
                onSubmit={(values) => {
                  setFormValues((prev) => ({ ...prev, ...values }));
                  goNext();
                }}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <Field name="name" type="text" placeholder="John Doe" className={inputCls(errors.name && touched.name)} />
                      <ErrorMessage name="name" component="p" className="mt-1 text-xs text-red-500" />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <Field name="email" type="email" placeholder="you@example.com" className={inputCls(errors.email && touched.email)} />
                      <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
                    </div>

                    {/* Passwords side by side on sm+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <Field name="password" type="password" placeholder="Min 6 characters" className={inputCls(errors.password && touched.password)} />
                        <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                        <Field name="confirmPassword" type="password" placeholder="Re-enter password" className={inputCls(errors.confirmPassword && touched.confirmPassword)} />
                        <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={goBack}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        ← Back
                      </button>
                      <button type="submit"
                        className={`flex-[2] py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 ${accent.btn}`}>
                        Continue →
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* ════════════ STEP 3 — Role extras + submit ════════════ */}
            {step === 3 && (
              <Formik
                initialValues={formValues}
                validationSchema={
                  userType === "ngo" ? ngoStepThreeSchema
                    : userType === "corporate" ? corpStepThreeSchema
                    : undefined
                }
                onSubmit={handleFinalSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4">
                    {/* Optional shared fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400 text-xs">(optional)</span></label>
                        <Field name="phone" type="text" placeholder="+1 (555) 000-0000" className={inputCls(false)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-gray-400 text-xs">(optional)</span></label>
                        <Field name="location" type="text" placeholder="City, Country" className={inputCls(false)} />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                      <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">{roles.find((r) => r.id === userType)?.label} details</span></div>
                    </div>

                    {/* Volunteer */}
                    {userType === "volunteer" && (
                      <>
                        {/* ── Skills tag selector ── */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skills <span className="text-gray-400 text-xs">(pick or type your own)</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {SKILL_OPTIONS.map((skill) => {
                              const active = formValues.skills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() =>
                                    setFormValues((prev) => ({
                                      ...prev,
                                      skills: active
                                        ? prev.skills.filter((s) => s !== skill)
                                        : [...prev.skills, skill],
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                                    ${active
                                      ? "bg-blue-100 border-blue-400 text-blue-700"
                                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                >
                                  {active ? "✓ " : ""}{skill}
                                </button>
                              );
                            })}
                          </div>
                          {/* Custom skill input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formValues.customSkillInput}
                              onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, customSkillInput: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const trimmed = formValues.customSkillInput.trim();
                                  if (trimmed && !formValues.skills.includes(trimmed)) {
                                    setFormValues((prev) => ({
                                      ...prev,
                                      skills: [...prev.skills, trimmed],
                                      customSkillInput: "",
                                    }));
                                  }
                                }
                              }}
                              placeholder="Add custom skill…"
                              className={inputCls(false) + " text-xs"}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = formValues.customSkillInput.trim();
                                if (trimmed && !formValues.skills.includes(trimmed)) {
                                  setFormValues((prev) => ({
                                    ...prev,
                                    skills: [...prev.skills, trimmed],
                                    customSkillInput: "",
                                  }));
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              + Add
                            </button>
                          </div>
                        </div>

                        {/* ── Interests tag selector ── */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interests <span className="text-gray-400 text-xs">(pick or type your own)</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {INTEREST_OPTIONS.map((interest) => {
                              const active = formValues.interests.includes(interest);
                              return (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() =>
                                    setFormValues((prev) => ({
                                      ...prev,
                                      interests: active
                                        ? prev.interests.filter((i) => i !== interest)
                                        : [...prev.interests, interest],
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                                    ${active
                                      ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                >
                                  {active ? "✓ " : ""}{interest}
                                </button>
                              );
                            })}
                          </div>
                          {/* Custom interest input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formValues.customInterestInput}
                              onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, customInterestInput: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const trimmed = formValues.customInterestInput.trim();
                                  if (trimmed && !formValues.interests.includes(trimmed)) {
                                    setFormValues((prev) => ({
                                      ...prev,
                                      interests: [...prev.interests, trimmed],
                                      customInterestInput: "",
                                    }));
                                  }
                                }
                              }}
                              placeholder="Add custom interest…"
                              className={inputCls(false) + " text-xs"}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = formValues.customInterestInput.trim();
                                if (trimmed && !formValues.interests.includes(trimmed)) {
                                  setFormValues((prev) => ({
                                    ...prev,
                                    interests: [...prev.interests, trimmed],
                                    customInterestInput: "",
                                  }));
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* NGO */}
                    {userType === "ngo" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Name</label>
                          <Field name="organizationName" type="text" placeholder="Your NGO name" className={inputCls(errors.organizationName && touched.organizationName)} />
                          <ErrorMessage name="organizationName" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Focus Areas <span className="text-gray-400 text-xs">(comma-separated)</span></label>
                          <Field name="focusAreas" type="text" placeholder="e.g. Education, Healthcare" className={inputCls(false)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Website <span className="text-gray-400 text-xs">(optional)</span></label>
                          <Field name="website" type="url" placeholder="https://your-ngo.org" className={inputCls(errors.website && touched.website)} />
                          <ErrorMessage name="website" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                      </>
                    )}

                    {/* Corporate */}
                    {userType === "corporate" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                          <Field name="companyName" type="text" placeholder="Your company name" className={inputCls(errors.companyName && touched.companyName)} />
                          <ErrorMessage name="companyName" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry <span className="text-gray-400 text-xs">(optional)</span></label>
                          <Field name="industry" type="text" placeholder="e.g. Technology, Finance" className={inputCls(false)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">CSR Interests <span className="text-gray-400 text-xs">(comma-separated, optional)</span></label>
                          <Field name="csrInterests" type="text" placeholder="e.g. Education, Environment" className={inputCls(false)} />
                        </div>
                      </>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={goBack}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        ← Back
                      </button>
                      <button type="submit" disabled={isSubmitting}
                        className={`flex-[2] py-3.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5
                          ${isSubmitting ? "bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0" : accent.btn}`}>
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating...
                          </span>
                        ) : (
                          "Create Account 🚀"
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Register;
