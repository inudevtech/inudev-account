import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { updateEmail } from '@firebase/auth';
import { sendEmailVerification } from 'firebase/auth';
import Link from 'next/link';
import { login } from '../util/firebase/auth';

const loginComponent = () => {
  const router = useRouter();
  const [errMsg, setErrMsg] = useState<String>();
  const isUpdateEmail = router.query.update === 'email';
  const isRemoveAccount = router.query.update === 'account';

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget as unknown as HTMLInputElement[];
    login(elements[Number(isUpdateEmail)].value, elements[1 + Number(isUpdateEmail)].value)
      .then(async (r) => {
        if (!r.user.emailVerified) {
          setErrMsg('メール認証ができていません。\n届いているメールをご確認ください。');
        } else if (isUpdateEmail) {
          await updateEmail(r.user, elements[0].value);
          await sendEmailVerification(r.user);
          setErrMsg('メールアドレスを変更しました。\nメールを確認して認証をしてください。');
        } else if (isRemoveAccount) {
          await r.user.delete();
          setErrMsg('アカウントを削除しました。\n犬開発のサービスをご利用いただきありがとうございました。');
        } else {
          router.replace('/').then(() => {
          });
        }
      })
      .catch(() => setErrMsg('ログインできませんでした。\n入力情報を確認してください。'));
  };

  let submitText;
  if (isUpdateEmail) {
    submitText = 'メールアドレスを変更';
  } else if (isRemoveAccount) {
    submitText = 'アカウントを削除';
  } else {
    submitText = 'ログイン';
  }

  let titleText;
  if (isUpdateEmail) {
    titleText = 'メールアドレスの変更にはログインが必要です';
  } else if (isRemoveAccount) {
    titleText = 'アカウントの削除にはログインが必要です';
  } else {
    titleText = '犬開発サービスにログイン';
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="shadow-xl rounded">
        <form className="m-5 mt-0 flex flex-col gap-2" onSubmit={submit}>
          <Image src="/logo.png" alt="ロゴ" className="mx-auto" width="300" height="200" objectFit="contain" />
          <h3 className="text-center text-xl">
            {titleText}
          </h3>
          {isUpdateEmail && (
          <input
            type="email"
            placeholder="新しいメールアドレス"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
            required
          />
          )}
          <input
            type="email"
            placeholder={`${isUpdateEmail ? '現在の' : ''}メールアドレス`}
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            className="border border-slate-300 p-1 rounded transition focus:border-slate-500 focus:border-2"
            required
          />
          {isRemoveAccount && (
            <label
              htmlFor="confirm"
            >
              <input type="checkbox" id="confirm" required />
              アカウントを本当に削除する
            </label>
          )}
          <input
            type="submit"
            className="transition p-2 border border-sky-100 rounded-md hover:shadow-lg hover:border-sky-600 block text-center bg-sky-400"
            value={submitText}
          />
          {!(isRemoveAccount || isUpdateEmail) && (
            <div className="text-center underline underline-offset-2">
              <Link href="/signup">アカウントを作成</Link>
            </div>
          )}
          <p className="text-red-500 whitespace-pre-wrap">
            {errMsg}
          </p>
        </form>
      </div>
    </div>
  );
};

export default loginComponent;
