import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useReducer } from "react";
import classNames from "classnames";
import { toast } from "react-toastify";
import {
  NothingFound,
  AddOrEditContent,
  AddTitle,
  ModalForDelete,
  PasswordInput,
} from "../../../components";
import { findUserByEmail } from "../../../helpers/auth";
import {
  connectDatabase,
  findProductsByUserPN,
} from "../../../helpers/db-util";
import { getSession } from "next-auth/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ACTIONS = {
  SET_PRODUCTS: "SET_PRODUCTS",
  SET_PRODUCT_ID: "SET_PRODUCT_ID",
  SET_PROFILE_INFO: "SET_PROFILE_INFO",
  SET_PROFILE_VIEW: "SET_PROFILE_VIEW",
  SET_OLD_PASSWORD_EYE: "SET_OLD_PASSWORD_EYE",
  SET_NEW_PASSWORD_EYE: "SET_NEW_PASSWORD_EYE",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_PRODUCTS:
      return { ...state, getProducts: action.products };
    case ACTIONS.SET_PRODUCT_ID:
      return { ...state, getProductId: action.productId };
    case ACTIONS.SET_PROFILE_INFO:
      return { ...state, getProfileInfo: action.profileInfo };
    case ACTIONS.SET_PROFILE_VIEW:
      return { ...state, profileView: action.text };
    case ACTIONS.SET_OLD_PASSWORD_EYE:
      return { ...state, oldPasswordEye: action.oldPasswordEye };
    case ACTIONS.SET_NEW_PASSWORD_EYE:
      return { ...state, newPasswordEye: action.newPasswordEye };
    default:
      return state;
  }
};

const UserPN = ({
  statusNumber,
  products,
  userData,
  userStatus,
  checkUserPhoneNumberInDb,
}) => {
  const router = useRouter();
  const { userPhoneNumber } = router.query;
  const [state, dispatch] = useReducer(reducer, {
    getProducts: null,
    getUserStatus: userStatus,
    getProductId: 0,
    getProfileInfo: userData,
    checkUserPhoneNumberInDb,
    profileView: "edit-profile",

    oldPasswordEye: true,
    newPasswordEye: true,
  });

  const setProducts = (products) => {
    dispatch({
      type: ACTIONS.SET_PRODUCTS,
      products,
    });
  };

  const UpdatePasswordSchema = Yup.object().shape({
    old_password: Yup.string()
      .required("?????? ???????? ???????? ?????????? ??????")
      .min(8, "?????? ???????? ???????? ?????????? 8 ?????????????? ????????")
      .max(16, "?????? ???????? ???????? ???????????? 16 ?????????????? ????????"),
    new_password: Yup.string()
      .required("?????? ???????? ???????? ?????????? ??????")
      .min(8, "?????? ???????? ???????? ???????? ?????????? 8 ?????????????? ????????")
      .max(16, "?????? ???????? ???????? ???????? ???????????? 16 ?????????????? ????????"),
  });

  const setNewPasswordEye = () => {
    const newPasswordEye = !state.newPasswordEye;
    dispatch({
      type: ACTIONS.SET_NEW_PASSWORD_EYE,
      newPasswordEye,
    });
  };

  const setOldPasswordEye = () => {
    const oldPasswordEye = !state.oldPasswordEye;
    dispatch({
      type: ACTIONS.SET_OLD_PASSWORD_EYE,
      oldPasswordEye,
    });
  };

  const setProfileView = (text) => {
    dispatch({
      type: ACTIONS.SET_PROFILE_VIEW,
      text,
    });
  };

  const deleteProductHandle = async () => {
    const allProducts = [...state.getProducts];
    try {
      const updatedProducts = state.getProducts.filter(
        (c) => c._id !== state.getProductId
      );
      setProducts(updatedProducts);

      await fetch(`/api/my-shop`, {
        method: "DELETE",
        body: JSON.stringify({ productId: state.getProductId }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.status !== 200) {
          setProducts(allProducts);
          toast.error("?????????? ???? ??????", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      });
    } catch (err) {
      setProducts(allProducts);
      console.log(err.message);
    }
  };

  const updateProfileInfo = async () => {
    await fetch(`/api/my-shop`, {
      method: "PUT",
      body: JSON.stringify({ profileInfo: state.getProfileInfo }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200)
        toast.success(
          "?????????? ???????????? ???????????? ???????? ?????? ???????????????? ???????? ?????? ?????? ?????????? ?????????????????? ???? ????????",
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      else
        toast.error("?????????? ???? ??????", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
    });
  };

  const setProductId = (productId) => {
    dispatch({
      type: ACTIONS.SET_PRODUCT_ID,
      productId,
    });
  };

  const setProfileInfo = (profileInfo) => {
    dispatch({
      type: ACTIONS.SET_PROFILE_INFO,
      profileInfo,
    });
  };

  const handleProfileInfo = (event) => {
    setProfileInfo({
      ...state.getProfileInfo,
      [event.target.name]: event.target.value,
    });
  };

  const saveProductId = (productId) => {
    setProductId(productId);
  };

  const changePasswordHandler = async (event) => {
    event.preventDefault();

    const { oldPassword, newPassword } = state;

    if (!oldPassword || !newPassword) {
      toast.error("???????? ???????? ???????????? ???? ???? ????????", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    fetch("/api/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      switch (response.status) {
        case 200:
          toast.success("???? ???????????? ?????? ???????? ?????????? ??????", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          break;
        case 401:
          toast.error("?????? ?????????? ???????? ???????? ??????", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        case 500:
          toast.error("?????????? ?????? ??????", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          break;
        case 404:
          toast.error("???????? ???????????? ???????? ??????", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          break;
        case 403:
          toast.error("?????????? ???????? ?????? ???? ?????????? ???? ???????????? ???????????? ??????????", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          break;
      }
    });
  };

  useEffect(() => {
    setProducts(products);
  }, [products]);

  switch (state.checkUserPhoneNumberInDb) {
    case "Confirmed":
      return (
        <>
          <AddTitle title={`?????????????? ${state.getProfileInfo.name}`} />

          <section className="text-capitalize mt-5" id="myShop-section">
            <div className="container shadow-lg mt-5">
              <div className="row shadow-lg rounded-3">
                {" "}
                {/* Nav pills */}{" "}
                <ul className="nav nav-pills nav-justified border-top border-danger">
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#edit-your-profile-shop"
                    >
                      ?????????????? ?????????????? ????
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      data-bs-toggle="pill"
                      href="#discounts"
                    >
                      ?????????????? ????
                    </a>
                  </li>
                </ul>{" "}
                {/* Tab panes */}{" "}
                <div className="tab-content py-5">
                  <div
                    className="tab-pane container fade"
                    id="edit-your-profile-shop"
                  >
                    <div className="row  mb-3">
                      <div className="col-md-6">
                        <div className="d-grid">
                          <button
                            style={{
                              backgroundColor:
                                state.profileView === "edit-profile" &&
                                "#67b129",
                            }}
                            type="button"
                            className="btn btn-success btn-block "
                            onClick={() => setProfileView("edit-profile")}
                          >
                            <i className="bi bi-card-checklist"></i> ????????????
                            ??????????????
                          </button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-grid">
                          <button
                            style={{
                              backgroundColor:
                                state.profileView === "change-password" &&
                                "#d8d844",
                            }}
                            type="button"
                            className="btn btn-warning btn-block"
                            onClick={() => setProfileView("change-password")}
                          >
                            <i className="bi bi-card-checklist"></i> ?????????? ??????
                            ????????
                          </button>
                        </div>
                      </div>
                    </div>
                    {state.profileView === "edit-profile" ? (
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-group mb-3 input-group-lg">
                            <span
                              className="input-group-text"
                              style={{
                                borderRadius: "0 25px 25px 0",
                              }}
                            >
                              <i className="bi bi-person-fill"></i>
                            </span>
                            <input
                              type="text"
                              name="name"
                              placeholder="?????? ?? ?????? ????????????????"
                              style={{
                                borderRadius: "25px 0 0 25px",
                              }}
                              value={state.getProfileInfo.name}
                              onChange={handleProfileInfo}
                              className="form-control"
                            />
                          </div>
                          <div className="input-group mb-3 input-group-lg">
                            <span
                              className="input-group-text"
                              style={{
                                borderRadius: "0 25px 25px 0",
                              }}
                            >
                              <i className="bi bi-instagram"></i>
                            </span>
                            <input
                              type="text"
                              name="instagram"
                              placeholder="???????? ???????????????????? ??????"
                              value={state.getProfileInfo.instagram}
                              onChange={handleProfileInfo}
                              style={{
                                borderRadius: "25px 0 0 25px",
                              }}
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3 input-group-lg">
                            <span
                              className="input-group-text"
                              style={{
                                borderRadius: "0 25px 25px 0",
                              }}
                            >
                              <i className="bi bi-building"></i>
                            </span>
                            <input
                              type="text"
                              name="companyName"
                              placeholder="?????? ???????? ??????"
                              style={{
                                borderRadius: "25px 0 0 25px",
                              }}
                              value={state.getProfileInfo.companyName}
                              onChange={handleProfileInfo}
                              className="form-control"
                            />
                          </div>
                          <div className="d-grid">
                            <button
                              type="button"
                              className="btn btn-edit-profile btn-block btn-lg"
                              onClick={updateProfileInfo}
                            >
                              <i className="bi bi-pencil-square"></i> ????????????
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Formik
                          initialValues={{
                            old_password: "",
                            new_password: "",
                          }}
                          validationSchema={UpdatePasswordSchema}
                          onSubmit={changePasswordHandler}
                        >
                          {({ touched, errors, isSubmitting, values }) => (
                            <Form className="php-email-form">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="input-group mb-3 input-group-lg">
                                    <PasswordInput
                                      passwordHandler={setOldPasswordEye}
                                      passwordEye={state.oldPasswordEye}
                                      errorMsg={
                                        <ErrorMessage
                                          component="div"
                                          name="old_password"
                                          className="invalid-feedback"
                                        />
                                      }
                                    >
                                      <Field
                                        type={
                                          state.oldPasswordEye
                                            ? "password"
                                            : "text"
                                        }
                                        name="old_password"
                                        placeholder="?????? ???????? ????????"
                                        style={{
                                          borderRadius: 0,
                                        }}
                                        autocomplete="off"
                                        className={`form-control
                          ${
                            touched.old_password && errors.old_password
                              ? "is-invalid"
                              : ""
                          }`}
                                      />
                                    </PasswordInput>
                                  </div>
                                  <div className="input-group mb-3 input-group-lg">
                                    <PasswordInput
                                      passwordHandler={setNewPasswordEye}
                                      passwordEye={state.newPasswordEye}
                                      errorMsg={
                                        <ErrorMessage
                                          component="div"
                                          name="new_password"
                                          className="invalid-feedback"
                                        />
                                      }
                                    >
                                      <Field
                                        type={
                                          state.oldPasswordEye
                                            ? "password"
                                            : "text"
                                        }
                                        name="new_password"
                                        placeholder="?????? ???????? ????????"
                                        style={{
                                          borderRadius: 0,
                                        }}
                                        autocomplete="off"
                                        className={`form-control
                          ${
                            touched.new_password && errors.new_password
                              ? "is-invalid"
                              : ""
                          }`}
                                      />
                                    </PasswordInput>
                                  </div>
                                  <div className="d-grid">
                                    <button
                                      type="submit"
                                      className="btn btn-edit-profile btn-block btn-lg"
                                    >
                                      <i className="bi bi-gear-wide-connected"></i>{" "}
                                      ?????????? ?????? ????????
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      </>
                    )}
                  </div>
                  <div className="tab-pane container active" id="discounts">
                    {state.getUserStatus === 1 && (
                      <div
                        className="alert alert-warning text-center"
                        style={{ fontWeight: "bold" }}
                      >
                        <div className="row">
                          <div className="col-12 text-center">
                            <Image
                              className="rounded-circle"
                              src="/assets/img/review-by-experts.gif"
                              alt="review-by-experts"
                              width={297}
                              height={285}
                            />
                          </div>
                        </div>
                        ?????????????? ?????? ?????? ?????????? ?????????????????? ?????? ???????????????? ???????? ??????
                        ????????
                      </div>
                    )}
                    {state.getUserStatus === 2 && (
                      <div
                        className="alert alert-danger text-center"
                        style={{ fontWeight: "bold" }}
                      >
                        <div className="row">
                          <div className="col-12 text-center">
                            <Image
                              src="/assets/img/close.png"
                              alt="review-by-experts"
                              width={130}
                              height={130}
                            />
                          </div>
                        </div>
                        ???????????????? ?????????????? ?????? ???????? ?????????????????? ?????????? ?????? ????????????????
                        ???????????? ???????? ???????? ???????? ?????????????? ???????????? ?? ???????????? ?????? ?????? ????
                        ???????? ?????????? ???? ?????? ???????????? ???? ???????????? ?????? ???????? ?????????? ????????
                        ????????
                        <ul className="list-group mt-3 p-0">
                          <li className="list-group-item">
                            ?????? ???????? ?????????? ????????
                          </li>
                          <li className="list-group-item">
                            ?????????? ???????? ?????????? ???????? ???? ?????????? ?????????? ?????????????? ????????
                          </li>
                        </ul>
                      </div>
                    )}
                    {state.getUserStatus === 3 && (
                      <>
                        <button
                          type="button"
                          className="btn btn-show-modal-new-discount mb-3"
                          data-bs-toggle="modal"
                          data-bs-target="#addEditModal"
                        >
                          <i className="bi bi-file-earmark-plus"></i> ?????????? ????????
                          ?????????? ????????
                        </button>

                        {state.getProducts &&
                        Object.keys(state.getProducts).length > 0 ? (
                          <>
                            <div className="table-responsive">
                              <table
                                className="table table-striped table-bordered table-hover text-center align-middle"
                                id="discounts-table"
                              >
                                <thead className="table-success">
                                  <tr>
                                    <th>
                                      <i className="bi bi-123"></i>
                                      ??????????
                                    </th>
                                    <th>
                                      <i className="bi bi-camera2"></i> ??????????
                                    </th>
                                    <th>
                                      <i className="bi bi-activity"></i> ??????
                                    </th>
                                    <th>
                                      <i className="bi bi-alarm"></i> ??????????
                                    </th>
                                    <th>
                                      <i className="bi bi-alarm"></i> ??????????
                                      ?????????? ???????? ??????????????????
                                    </th>
                                    <th>
                                      <i className="bi bi-trash-fill"></i> ??????
                                      ??????????
                                    </th>
                                    <th>
                                      <i className="bi bi-pencil-fill"></i>{" "}
                                      ???????????? ??????????
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {state.getProducts.map((product, index) => {
                                    let keyId;
                                    if (product._id)
                                      keyId = product._id.toString();
                                    else
                                      keyId = Math.floor(
                                        Math.random() * 1000000
                                      ).toString();

                                    return (
                                      <tr key={keyId}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>
                                          <Image
                                            style={{ objectFit: "cover" }}
                                            src={`/uploads/${product.photo1.url}`}
                                            alt={product.name}
                                            width={100}
                                            height={100}
                                          />
                                        </td>
                                        <td>{product.name}</td>
                                        <td>
                                          <span
                                            className={classNames(
                                              "badge",
                                              "text-uppercase",
                                              {
                                                available: product.condition,
                                                unavailable: !product.condition,
                                              }
                                            )}
                                          >
                                            {product.condition
                                              ? "??????????"
                                              : "??????????????"}
                                          </span>
                                        </td>
                                        <td
                                          className={classNames("fw-bold", {
                                            "text-success":
                                              product.RevieWbyExperts ===
                                              "confirmed",
                                            "text-danger":
                                              product.RevieWbyExperts ===
                                              "not confirmed",
                                            "text-warning":
                                              product.RevieWbyExperts ===
                                              "under investigation",
                                          })}
                                        >
                                          {product.RevieWbyExperts ===
                                            "confirmed" && "?????????? ??????"}
                                          {product.RevieWbyExperts ===
                                            "not confirmed" && "???? ??????"}
                                          {product.RevieWbyExperts ===
                                            "under investigation" &&
                                            "?????? ??????????"}
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="btn btn-delete"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteModal"
                                            onClick={() =>
                                              saveProductId(product._id)
                                            }
                                          >
                                            ??????
                                          </button>
                                        </td>
                                        <td>
                                          <Link
                                            href={{
                                              pathname:
                                                "/my-shop/[userPhoneNumber]/[productId]",
                                              query: {
                                                userPhoneNumber:
                                                  userPhoneNumber,
                                                productId: product._id,
                                              },
                                            }}
                                          >
                                            <button
                                              type="button"
                                              className="btn btn-edit"
                                            >
                                              ????????????
                                            </button>
                                          </Link>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : (
                          <NothingFound text="???????????? ?????????? ???????? ?????? ?????? ???? ???????????? ?????????? ?????????? ????????" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Start Modal For Delete Form */}
            <ModalForDelete handleDelete={deleteProductHandle} />
            {/* End Modal For Delete Form */}

            {/* Start Modal For Edit/Add Form */}

            <div className="modal fade" id="addEditModal">
              <div className="modal-dialog modal-dialog-scrollable modal-xl modal-dialog-centered">
                <div className="modal-content">
                  {/* Modal Header */}
                  <div className="modal-header">
                    <h4 className="modal-title">
                      <i className="bi bi-file-earmark-plus"></i> ?????????? ????????
                      ??????????
                    </h4>
                    <button
                      type="button"
                      className="btn-close m-0"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  {/* Modal body */}
                  <div className="modal-body text-center">
                    <AddOrEditContent
                      addOrEdit="add"
                      userPhoneNumber={userPhoneNumber}
                      product={state.getProducts}
                      changeProduct={setProducts}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End Modal For Edit/Add Form */}
          </section>
        </>
      );
    case "Not SignIn":
      return (
        <>
          <AddTitle title="?????????? ????????" />
          <NothingFound text="???????? ???? ???????? ???????? ???????? ?? ???????????? ???????????? ???????? ???????????? (??????????????) ???????? ?????? ?????? ????????" />
        </>
      );
  }
};

export default UserPN;

export const getServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  let checkUserPhoneNumberInDb = "Not SignIn";
  if (session) {
    const { userPhoneNumber } = context.params;

    let client = null;
    let products = null;
    let userData = null;
    let userStatus = null;
    let statusNumber = 200;

    try {
      client = await connectDatabase();
    } catch (error) {
      statusNumber = 500;
    }

    if (statusNumber != 500)
      try {
        const { email } = session.user;
        const userDataFetch = await findUserByEmail(client, email);

        if (userDataFetch.length > 0) {
          userData = userDataFetch.map((user) => {
            user._id = user._id.toString();
            return user;
          });
          userData = userDataFetch[0];

          if (userPhoneNumber === userData.phoneNumber) {
            checkUserPhoneNumberInDb = "Confirmed";

            switch (userData.RevieWbyExperts) {
              case "under investigation":
                userStatus = 1;
                break;
              case "not confirmed":
                userStatus = 2;
                break;
              case "confirmed":
                userStatus = 3;
                break;
            }

            products = await findProductsByUserPN(client, userPhoneNumber);
            if (products.length > 0)
              products = products.map((p) => {
                p._id = p._id.toString();
                return p;
              });
            else products = null;
          }
        } else userData = null;
      } catch (error) {
        statusNumber = 500;
      }

    client.close();

    return {
      props: {
        statusNumber,
        products,
        userData,
        userStatus,
        checkUserPhoneNumberInDb,
      },
    };
  }

  return {
    props: {
      checkUserPhoneNumberInDb,
    },
  };
};
