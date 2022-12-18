import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Contact = () => {
  const ContactSchema = Yup.object().shape({
    name: Yup.string().required("نام و نام خانوادگی ضروری است"),

    email: Yup.string()
      .email("فرمت ایمیل نامعتبر است")
      .required("ایمیل ضروری است"),

    subject: Yup.string().required("نام و نام خانوادگی ضروری است"),
    message: Yup.string().required("پیام ضروری است "),
  });

  const contactFormHandler = async (event) => {
    event.preventDefault();

    console.log("event.target.name>>>>");
    console.log(event);
    //console.log(event.target.name);
    // contactValues.forEach((value) => {
    //   if (!value) {
    //   }
    // });

    // if (contactValues)
    //   await fetch("/api/contacts", {
    //     method: "POST",
    //     body: JSON.stringify({ contactData }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }).then((response) => {
    //     if (response.status === 201)
    //       toast.success("پیام شما با موفقیت ارسال شد و مورد بررسی قرار گرفت", {
    //         position: "top-center",
    //         autoClose: 5000,
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //       });
    //     else
    //       toast.error("مشکلی در ارسال پیام پیش آمد", {
    //         position: "top-center",
    //         autoClose: 5000,
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //       });
    //   });
    // else
    //   toast.error("لطفا تمام فیلد ها را تکمیل کنید", {
    //     position: "top-center",
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //   });
  };

  return (
    <>
      <Formik
        initialValues={{
          name: "",
          email: "",
          subject: "",
          message: "",
        }}
        validationSchema={ContactSchema}
        onSubmit={contactFormHandler}
      >
        {({ touched, errors, isSubmitting, values }) =>
          !isSubmitting ? (
            <Form className="php-email-form">
              <div className="row">
                <div className="form-group col-md-6">
                  <label for="name">نام شما</label>
                  <Field
                    type="text"
                    name="name"
                    autocomplete="off"
                    className={`form-control
                          ${touched.name && errors.name ? "is-invalid" : ""}`}
                  />

                  <ErrorMessage
                    component="div"
                    name="name"
                    className="invalid-feedback"
                  />
                </div>

                <div className="form-group col-md-6">
                  <label for="name">ایمیل شما</label>

                  <Field
                    type="text"
                    name="email"
                    autocomplete="off"
                    className={`form-control
                          ${touched.email && errors.email ? "is-invalid" : ""}`}
                  />

                  <ErrorMessage
                    component="div"
                    name="email"
                    className="invalid-feedback"
                  />
                </div>

                <div className="form-group col-12">
                  <label for="name">عنوان</label>
                  <Field
                    type="text"
                    name="subject"
                    autocomplete="off"
                    className={`form-control
                          ${
                            touched.subject && errors.subject
                              ? "is-invalid"
                              : ""
                          }`}
                  />

                  <ErrorMessage
                    component="div"
                    name="subject"
                    className="invalid-feedback"
                  />
                </div>

                <div className="form-group">
                  <label for="message">پیام</label>

                  <Field
                    type="text"
                    name="message"
                    as="textarea"
                    autocomplete="off"
                    className={`form-control form-textarea
                          ${
                            touched.message && errors.message
                              ? "is-invalid"
                              : ""
                          }`}
                  />

                  <ErrorMessage
                    component="div"
                    name="message"
                    className="invalid-feedback"
                  />
                </div>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-login-register btn-block btn-lg"
                >
                  <i class="bi bi-telephone"></i> ارسال پیام
                </button>
              </div>
            </Form>
          ) : null
        }
      </Formik>
    </>
  );
};

export default Contact;