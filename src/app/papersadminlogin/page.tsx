"use client";
import { useState } from "react";
import axios, { type AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  type LoginResponse,
  type ErrorResponse,
  type DecryptedLoginResponse,
} from "@/interface";
import Cryptr from "cryptr";
import { handleAPIError } from "@/app/util/error";
import { totalmem } from "os";
import toast from "react-hot-toast";
import { ApiError } from "next/dist/server/api-utils";
const cryptr = new Cryptr(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret",
);

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function apiLogin() {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      const { res } = response.data;
      const decryptedToken = cryptr.decrypt(res);
      try {
        const message = JSON.parse(decryptedToken) as DecryptedLoginResponse;
        const token = message.token;
        localStorage.setItem("token", token);
        return response.data;
        // router.push("/adminupload");
      } catch (error) {
        toast.error(`Failed to parse decrypted token${error}`);
      }
    } catch (error) {
      throw handleAPIError(error);
    }
  }
  const handleLogin = async () => {
    try {
      const response = await toast.promise(
        apiLogin(),

        {
          loading: "Logging you in...",
          success: "Logged in!",
          error: (err: ApiError) => err.message,
        },
      );
      if (response && "res" in response) {
        setTimeout(() => {
          router.push("/adminupload");
        }, 1500);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Login</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
