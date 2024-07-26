"use client";
import { FormEvent, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://backside-9xpi.onrender.com/auth/sign-in",
        {
          email,
          password,
        }
      );
      setMessage("Welcome!");
      localStorage.setItem("token", response.data.accessToken);
      router.push("/home");
    } catch (error) {
      console.error("Login failed", error);
      setMessage("Invalid Credentials!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-[400px] h-[400px] bg-gray-600 relative rounded-[30px] flex items-center text-white justify-start pt-20 px-10 flex-col gap-10">
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "300px",
          }}
        >
          <h2 className="text-2xl self-center">Sign in</h2>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-8 rounded-lg pl-2 bg-gray-500 outline-none"
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-8 rounded-lg pl-2 bg-gray-500 outline-none"
            />
          </label>
          {message && <p className="text-blue-400">{message}</p>}
          <button
            type="submit"
            className="self-center w-[100px] h-[40px] bg-blue-600 rounded-[20px] flex items-center justify-center text-xl mt-4"
          >
            Login
          </button>
        </form>
        <p>
          Don&apos;t have an account?
          <span className="text-blue-700">
            <Link href="/">Sign-Up</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
