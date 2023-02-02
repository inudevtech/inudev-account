import {
  faGoogle,
  faTwitter,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { Dispatch, FC, SetStateAction } from "react";
import { login } from "../util/firebase/auth";

const loginComponent: FC<{ setErrMsg: Dispatch<SetStateAction<string>> }> = ({
  setErrMsg,
}) => {
  const router = useRouter();
  return (
  <>
    <div
      className="login-button"
      onClick={async () => {
        login(1)
          .then(() => router.push({ pathname: "/" }).then(() => {}))
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\nしばらくしてから再度お試しください。\n※既に使用されているメールアドレスでの登録はできません。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faGoogle} size="xl" />
      <p>Login with Google</p>
    </div>
    <div
      className="login-button"
      onClick={async () => {
        login(2)
          .then(() => router.push({ pathname: "/" }).then(() => {}))
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\nしばらくしてから再度お試しください。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faTwitter} size="xl" />
      <p>Login with Twitter</p>
    </div>
    <div
      className="login-button"
      onClick={async () => {
        login(3)
          .then(() => router.push({ pathname: "/" }).then(() => {}))
          .catch(() =>
            setErrMsg(
              "ログインできませんでした。\nしばらくしてから再度お試しください。\n※既に使用されているメールアドレスでの登録はできません。"
            )
          );
      }}
      aria-hidden
    >
      <FontAwesomeIcon icon={faGithub} size="xl" />
      <p>Login with Github</p>
    </div>
  </>
)
    };

export default loginComponent;
