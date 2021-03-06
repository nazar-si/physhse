import React, { useContext, useState } from "react";
import Head from "next/head";
import style from "./style.module.scss";
import Panel from "../Panel/panel";
import { Divider, Text } from "@mantine/core";
import Button from "../Button/button";
import Link from "next/link";
import { auth } from "../../lib/firebase";
import { UserContext } from "../../lib/context";

export type Props = {};

export default function LoginForm(props: Props) {
    const { user, username, role } = useContext(UserContext);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState("");
    const [email, setEmail] = useState("editor@hse.ru");
    const [editor, setEditor] = useState("");
    const [password, setPassword] = useState("");
    // password = "Hse_4669201609" :)

    const handleEmail = (email: string) => {
        email = email.toLowerCase();
        email = email.replaceAll(" ", "");
        setEmail(email);
    };
    const signIn = async (e: any) => {
        e.preventDefault();
        try {
            if (email.length == 0) {
                if (password.length == 0) {
                    setMessage("Введите почту и пароль");
                    return;
                }
                setMessage("Введите почту");
                return;
            }
            if (password.length == 0) {
                setMessage("Введите пароль");
                return;
            }
            if (editor.length == 0) {
                setMessage("Введите имя редактора");
                return;
            }
            await auth.signInWithEmailAndPassword(email, password).then(() => {
                window.localStorage.setItem("username", editor);
                window.localStorage.setItem("role", role);
                // location.reload();
                setMessage("");
            });
        } catch (error: any) {
            let code = error.code;
            switch (code) {
                case "auth/invalid-email":
                    setMessage("Неверный формат почты");
                    break;
                case "auth/user-not-found":
                    setMessage("Пользователь с такой почтой не найден");
                    break;
                case "auth/wrong-password":
                    setMessage("Неверный пароль");
                    break;
                default:
                    setMessage("Неизвестная ошибка");
                    break;
            }
        }
    };
    const signOut = async (e: any) => {
        e.preventDefault();
        await auth.signOut().then(() => {
            window.localStorage.removeItem("username");
            window.localStorage.removeItem("role");
            location.reload();
        });
    };

    return (
        <form className={style.wrapper} onSubmit={!user ? signIn : signOut}>
            <Panel className={style.panel}>
                <div className={style.title}>{!user ? "Вход" : "Выход"}</div>
                <Text color="red" align="center">
                    {message}
                </Text>
                <Divider my="sm"></Divider>
                {!user && (
                    <>
                        <input
                            type="text"
                            placeholder="Имя редактора"
                            onChange={(e) => {
                                setEditor(e.target.value);
                            }}
                            value={editor}
                        />
                        {/* <input type="text" placeholder='Почта @hse' onChange={(e)=>{handleEmail(e.target.value)}} value={email}/> */}
                        <input
                            type="password"
                            placeholder="Пароль"
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            value={password}
                        />
                        <Divider my="sm"></Divider>
                        <input type="submit" value="Вход" />
                    </>
                )}
                {user && (
                    <>
                        <Text align="center">
                            Вы вошли как <b>{username}</b>
                        </Text>
                        <Divider my="sm"></Divider>
                        <input type="submit" value="Выход" />
                    </>
                )}
                {/* <Link passHref href="/reg"><div className={style.another}>Перейти к регистрации</div></Link> */}
            </Panel>
        </form>
    );
}
