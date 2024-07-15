"use client";
import { useState, useEffect, FormEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

interface Invoice {
  _id: string;
  description: string;
  amount: number;
  price: number;
}

interface Users {
  _id: string;
  email: string;
  password: string;
}

const HomePage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [show, setShow] = useState(false);
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
    } else {
      fetchInvoices(token);
      getUsers(token);
    }
  }, []);

  const getUsers = async (token: string | null) => {
    try {
      const response = await axios.get(
        "https://backside-71fi.onrender.com/user/currentuser",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserId(response.data._id);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchInvoices = async (token: string | null) => {
    try {
      const response: AxiosResponse<Invoice[]> = await axios.get(
        "https://backside-71fi.onrender.com/invoices",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoices(response.data);
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to add an invoice");
      return;
    }

    try {
      const response: AxiosResponse<Invoice> = await axios.post(
        "https://backside-71fi.onrender.com/invoices",
        { description, amount, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoices([...invoices, response.data]);
      setDescription("");
      setAmount(0);
      setPrice(0);
      setMessage("Invoice added successfully");
    } catch (error) {
      setMessage("Failed to add invoice");
      console.error("Failed to add invoice", error);
    }
  };

  const handleDelete = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to delete an invoice");
      return;
    }

    try {
      await axios.delete(`https://backside-71fi.onrender.com/invoices/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedInvoices = invoices.filter((invoice) => invoice._id !== _id);
      setInvoices(updatedInvoices);
      setMessage("Invoice deleted successfully");
    } catch (error) {
      setMessage("Failed to delete invoice");
      console.error("Failed to delete invoice", error);
    }
  };

  const handleUpdate = async (_id: string, newData: Partial<Invoice>) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to update an invoice");
      return;
    }

    try {
      const response: AxiosResponse<Invoice> = await axios.patch(
        `https://backside-71fi.onrender.com/invoices/${_id}`,
        newData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedInvoices = invoices.map((invoice) =>
        invoice._id === _id ? response.data : invoice
      );
      setInvoices(updatedInvoices);
      setMessage("Invoice updated successfully");
      setEditingInvoiceId(null);
      setDescription("");
      setAmount(0);
      setPrice(0);
    } catch (error) {
      setMessage("Failed to update invoice");
      console.error("Failed to update invoice", error);
    }
  };

  const toggleEditInvoice = (_id: string) => {
    setEditingInvoiceId(editingInvoiceId === _id ? null : _id);
  };

  const handleDeleteAcc = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to delete your account.");
      return;
    }

    try {
      await axios.delete(`https://backside-71fi.onrender.com/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      setMessage("Account deleted successfully.");
      router.push("/");
    } catch (error) {
      setMessage("Failed to delete account.");
      console.error("Failed to delete account", error);
    }
  };

  const handleEditEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to edit your email.");
      return;
    }

    try {
      const response: AxiosResponse<Users> = await axios.patch(
        `https://backside-71fi.onrender.com/user/${userId}`,
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Account updated successfully");
      setEditingEmail(false);
      setShow(false);
      setNewEmail("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogOut = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to log out.");
      return;
    } else {
      localStorage.removeItem("token");
      router.push("/sign-in");
    }
  };

  return (
    <div>
      <header className="w-full absolute top-0 bg-blue-600 left-0 h-[60px]">
        <div className="cursor-pointer" onClick={() => setShow(!show)}>
          <h3 className="absolute right-[70px] top-[16px] text-white">
            Profile
          </h3>
          <img
            className="w-10 h-10 absolute right-6 top-[10px]"
            src="/images/user.png"
            alt=""
          />
        </div>
        {show && (
          <div className="pt-[10px] pb-[10px] absolute right-0 w-[200px] flex flex-col justify-center gap-[20px] items-center bg-blue-600 top-[60px] rounded-b-[10px]">
            <h3
              onClick={handleLogOut}
              className="hover:text-red-500 text-white cursor-pointer"
            >
              Log Out
            </h3>
            <h3
              onClick={() => setEditingEmail(!editingEmail)}
              className="hover:text-red-500 text-white cursor-pointer"
            >
              Edit my email
            </h3>
            {editingEmail && (
              <form onSubmit={handleEditEmail}>
                <input
                  className="w-[196px] outline-white outline-solid outline-[1px] bg-blue-500 rounded text-white h-8 m-0 p-[2px]"
                  type="email"
                  placeholder="example@example.com"
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </form>
            )}
            <h3
              onClick={handleDeleteAcc}
              className="hover:text-red-500 text-white cursor-pointer"
            >
              Delete my account
            </h3>
          </div>
        )}
      </header>
      <div className="w-full h-full mt-[60px]" onClick={() => setShow(false)}>
        <div className="p-6 max-w-md mx-auto border-solid border-gray-800 border-2 rounded-[10px]">
          <h1 className="text-2xl font-bold mb-4">Add Invoice</h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <h1 className="text-xl font-bold">Description</h1>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border rounded-md p-2"
              required
            />
            <h1 className="text-xl font-bold">Amount</h1>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Amount"
              className="border rounded-md p-2"
              required
            />
            <h1 className="text-xl font-bold">Price</h1>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Price"
              className="border rounded-md p-2"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition duration-300"
            >
              Add Invoice
            </button>
          </form>
          {message && <p className="mt-2 text-slate-600">{message}</p>}
          <h2 className="text-xl font-bold mt-6">Invoices</h2>
          <ul className="mt-2 space-y-2">
            {invoices.map((invoice) => (
              <li key={invoice._id} className="border p-4 rounded-md">
                {editingInvoiceId === invoice._id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(invoice._id, { description, amount, price });
                    }}
                    className="flex space-x-2 flex-col gap-4 justify-center items-center"
                  >
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      className="border rounded-md p-2 ml-2"
                      required
                    />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="Amount"
                      className="border rounded-md p-2 m-0"
                      required
                    />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="Price"
                      className="border rounded-md p-2"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-green-500 text-white rounded-md py-1 px-2 hover:bg-green-600 transition duration-300"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">
                        {invoice.description}
                      </p>
                      <p className="text-gray-500">
                        Amount: {invoice.amount}, Price: ${invoice.price}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleEditInvoice(invoice._id)}
                        className="bg-green-500 text-white rounded-md py-1 px-2 hover:bg-green-600 transition duration-300"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="bg-red-500 text-white rounded-md py-1 px-2 hover:bg-red-600 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
