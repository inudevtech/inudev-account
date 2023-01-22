import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { updateProfile } from "firebase/auth";
import { AccountContext } from "./_app";
import {
  logout,
  onAuthStateChanged,
  resetPassword,
} from "../util/firebase/auth";

const index = () => {
  const router = useRouter();
  const AccountKind = {
    Icon: "Icon",
    UserName: "UserName",
  };
  const [editedData, setEditedData] = useState<string[]>([]);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { AccountState } = useContext(AccountContext);
  const [iconURL, setIconURL] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>();
  const [loading, setLoading] = useState(false);
  const [clickedPassword, setClickedPassword] = useState(false);

  useEffect(() => {
    onAuthStateChanged((user) => {
      if (user == null) {
        router.replace("/login").then(() => {});
      } else {
        setIconURL("photoURL" in user ? user.photoURL : null);
        setUserName("displayName" in user ? user.displayName : null);
      }
    });
  }, []);

  function resizeImg(imgData: any) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(imgData, 0, 0, 256, 256);
    return canvas.toDataURL("image/png");
  }

  const fileSelected = (e: FormEvent<HTMLLabelElement>) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setIconURL(resizeImg(img));
        setEditedData([...editedData, AccountKind.Icon]);
      };
      img.src = reader.result as string;
    };

    const file = target.files[0];
    reader.readAsDataURL(file);
  };

  const removeEditedData = (type: string) => {
    setEditedData(editedData.filter((data) => data !== type));
    if (editedData) {
      setLoading(false);
    }
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (editedData.includes(AccountKind.Icon)) {
      // Recaptcha認証を行う
      if (executeRecaptcha) {
        executeRecaptcha!("upload").then(async (recaptcha) => {
          if (iconURL !== null) {
            const byteString = Buffer.from(iconURL?.split(",")[1]!, "base64");

            const params = {
              token: await AccountState?.getIdToken(true),
              icon: true,
              recaptcha,
            };

            const body = {
              filenames: ["icon.png"],
              contentLengths: [byteString.byteLength],
            };

            axios
              .post(`${process.env.NEXT_PUBLIC_HOTDOG_URL}/api/upload`, body, {
                params,
              })
              .then((res) => {
                axios
                  .put(res.data.url, byteString, {
                    headers: {
                      "Content-Type": "application/octet-stream",
                      "x-goog-acl": "public-read",
                      "x-goog-content-length-range": `${byteString.byteLength},${byteString.byteLength}`,
                    },
                  })
                  .then(() => {
                    updateProfile(AccountState!, {
                      photoURL: res.data.id,
                    });
                    removeEditedData(AccountKind.Icon);
                  });
              });
          } else {
            await updateProfile(AccountState!, {
              photoURL: "",
            });
            removeEditedData(AccountKind.Icon);
          }
        });
      }
    } else if (editedData.includes(AccountKind.UserName)) {
      await updateProfile(AccountState!, {
        displayName: userName as string,
      });
      removeEditedData(AccountKind.UserName);
    }
  };

  const remove = () => {
    setIconURL(null);
    setEditedData([...editedData, AccountKind.Icon]);
  };

  const updatePassword = async () => {
    await resetPassword();
    setClickedPassword(true);
  };

  const editUserName = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!editedData.includes(AccountKind.UserName)) {
      setEditedData([...editedData, AccountKind.UserName]);
    }
    setUserName(e.target.value);
  };

  const updateEmail = () => {
    router
      .push({ pathname: "/login", query: { update: "email" } })
      .then(() => {});
  };

  const removeAccount = () => {
    router
      .push({ pathname: "/login", query: { update: "account" } })
      .then(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3">
      {AccountState != null ? (
        <div className="container mx-auto bg-white shadow-lg rounded-lg max-w-[1024px]">
          <form className="flex flex-col items-start gap-3 p-3" onSubmit={save}>
            <h2 className="text-2xl">アイコン</h2>
            <div className="flex gap-2 flex-col md:flex-row items-start">
              {iconURL === null ? (
                <p className="text-lg">アイコンは指定されていません</p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconURL}
                  alt="アイコン"
                  className="w-full max-w-[256px] max-w-fit rounded-full"
                />
              )}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="upload"
                  className="transition p-2 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 text-center"
                  onChange={fileSelected}
                >
                  <FontAwesomeIcon icon={faUpload} className="pr-2" />
                  アップロード
                  <input
                    type="file"
                    id="upload"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                  />
                </label>
                <button
                  type="button"
                  onClick={remove}
                  className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 text-center disabled:bg-slate-400 disabled:border-slate-500 disabled:text-slate-600"
                  disabled={iconURL === null}
                >
                  削除
                </button>
              </div>
            </div>
            <h2 className="text-2xl">ユーザー情報</h2>
            <div className="flex flex-col gap-2">
              <div className="flex md:items-center gap-2 flex-col md:flex-row">
                <p>ユーザー名</p>
                <input
                  type="text"
                  placeholder="ユーザー名"
                  defaultValue={userName!}
                  onChange={editUserName}
                  className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2 max-w-[200px]"
                  required
                />
              </div>
              {AccountState?.providerData[0].providerId === "password" && (
                <>
                  <button
                    type="button"
                    onClick={updateEmail}
                    className="transition p-1 border border-red-500 rounded-md hover:shadow-lg hover:border-red-600 text-center"
                  >
                    メールアドレスの再設定をする
                  </button>
                  <button
                    type="button"
                    onClick={updatePassword}
                    className="transition p-1 border border-red-500 rounded-md hover:shadow-lg hover:border-red-600 text-center"
                  >
                    パスワードの再設定をする
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={removeAccount}
                className="transition p-1 border border-red-500 rounded-md hover:shadow-lg hover:border-red-600 text-center"
              >
                アカウントを削除する
              </button>
              {clickedPassword && (
                <p>
                  再設定用のページリンクを設定したメールアドレスに送信しました。
                  <br />
                  メール内のリンクからパスワードを再設定してください。
                </p>
              )}
            </div>
            <button
              type="submit"
              className="transition p-2 border bg-blue-200 border-blue-300 rounded-md hover:shadow-lg hover:border-blue-500 text-center disabled:bg-slate-400 disabled:border-slate-500 disabled:text-slate-600"
              disabled={editedData.length === 0}
            >
              {loading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin px-2"
                />
              ) : null}
              {editedData.length === 0 ? "保存済み" : "保存"}
            </button>
            <button
              type="button"
              className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
              onClick={() => logout(true)}
            >
              ログアウト
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default index;
