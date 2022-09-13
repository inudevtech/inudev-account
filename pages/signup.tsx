import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Component, FormEvent } from "react";
import Image from "next/image";
import { NextRouter, withRouter } from "next/router";
import Link from "next/link";
import { signUp } from "../util/firebase/auth";

interface LoginStateProps {
  errMsg: string;
  state: boolean | null;
  loading: boolean;
}

interface WithRouterProps {
  router: NextRouter;
}

class loginModal extends Component<WithRouterProps, LoginStateProps> {
  constructor(props: WithRouterProps) {
    super(props);
    this.state = {
      errMsg: "",
      state: null,
      loading: false,
    };
  }

  submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    this.setState({ loading: true });
    signUp(0, elements[0].value, elements[1].value, elements[2].value)
      .then(async () => {
        this.setState({
          state: false,
          errMsg:
            "仮登録処理が完了しました。\nメールを確認して本登録処理を完了してください。\n本登録が完了するまでログインすることはできません。",
        });
      })
      .catch(() =>
        this.setState({
          state: true,
          errMsg: "登録ができませんでした。\n入力情報を確認してください。",
        })
      )
      .finally(() => this.setState({ loading: false }));
  }

  render() {
    const moveLoginPage = () => {
      const { router } = this.props;
      router.push({ pathname: "/login" }).then(() => {});
    };

    const { errMsg, loading, state } = this.state;
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="shadow-xl rounded">
          <form
            className="m-5 mt-0 flex flex-col gap-2"
            onSubmit={this.submit.bind(this)}
          >
            <Image
              src="/logo.png"
              alt="ロゴ"
              className="mx-auto"
              width="300"
              height="200"
              objectFit="contain"
            />
            <h3 className="text-center text-xl">犬開発アカウントを作成</h3>
            <input
              type="email"
              placeholder="メールアドレス"
              className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
              required
            />
            <input
              type="password"
              placeholder="パスワード"
              className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
              required
            />
            <input
              type="text"
              placeholder="ニックネーム"
              className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
              required
            />

            {state === null || state ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
                >
                  {loading ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin px-2"
                    />
                  ) : null}
                  アカウントを作成
                </button>
                <Image
                  src="/btn_google_signin.png"
                  alt="Login With Google"
                  onClick={async () => {
                    await signUp(1);
                    moveLoginPage();
                  }}
                  className="mx-auto cursor-pointer"
                  width="300"
                  height="50"
                  objectFit="contain"
                />
              </>
            ) : null}
            <p className={`whitespace-pre-wrap ${state ? "text-red-500" : ""}`}>
              {errMsg}
            </p>
            {state === false ? (
              <button
                type="button"
                className="transition p-1 border border-slate-300 rounded-md hover:shadow-lg hover:border-slate-500 block text-center"
                onClick={moveLoginPage}
              >
                ログイン画面に移る
              </button>
            ) : (
              <div className="text-center underline underline-offset-2">
                <Link href="/login">ログイン</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(loginModal);
