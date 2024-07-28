"use client";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

interface Invoice {
  _id: string;
  description: string;
  amount: number;
  price: number;
  userId: string;
}

interface User {
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
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [show, setShow] = useState(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [filterPrice, setFilterPrice] = useState<number>(0);
  const notify = (msg: string) => toast.success(msg);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
    } else {
      fetchUserData(token);
    }
  }, [router]);

  const fetchUserData = async (token: string | null) => {
    try {
      const response = await axios.get(
        "https://backside-vcwl.onrender.com/user/currentuser",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserId(response.data._id);
      fetchInvoices(token, response.data._id);
      setCurrentEmail(response.data.email);
      setNewEmail(response.data.email);
    } catch (error) {
      throw error;
    }
  };

  const fetchInvoices = async (token: string | null, userId: string) => {
    try {
      const response: AxiosResponse<{ invoices: Invoice[] }> = await axios.get(
        `https://backside-vcwl.onrender.com/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { invoices } = response.data;

      if (Array.isArray(invoices)) {
        setInvoices(invoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      setInvoices([]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (amount <= 0 || price <= 0) {
      setMessage("Amount and Price must be positive numbers");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to add an invoice");
      return;
    }

    try {
      const response: AxiosResponse<Invoice> = await axios.post(
        "https://backside-vcwl.onrender.com/invoices/",
        { description, amount, price, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInvoices((prevInvoices) => [...prevInvoices, response.data]);
      setDescription("");
      setAmount(0);
      setPrice(0);
      notify("Invoice Added Successfully");
    } catch (error) {
      setMessage("Failed to add invoice");
    }
  };

  const handleDelete = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to delete an invoice");
      return;
    }

    try {
      await axios.delete(`https://backside-vcwl.onrender.com/invoices/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedInvoices = invoices.filter((invoice) => invoice._id !== _id);
      setInvoices(updatedInvoices);
      notify("Invoice Deleted Successfully");
    } catch (error) {
      setMessage("Failed to delete invoice");
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
        `https://backside-vcwl.onrender.com/invoices/${_id}`,
        newData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedInvoices = invoices.map((invoice) =>
        invoice._id === _id ? response.data : invoice
      );
      setInvoices(updatedInvoices);
      setEditingInvoice(null);
      setDescription("");
      setAmount(0);
      setPrice(0);
      notify("Invoice Updated Successfully");
    } catch (error) {
      setMessage("Failed to update invoice");
    }
  };
  const toggleEditInvoice = (_id: string) => {
    if (editingInvoice === _id) {
      setEditingInvoice(null);
      setDescription("");
      setAmount(0);
      setPrice(0);
    } else {
      const invoiceToEdit = invoices.find((invoice) => invoice._id === _id);
      if (invoiceToEdit) {
        setEditingInvoice(_id);
        setDescription(invoiceToEdit.description);
        setAmount(invoiceToEdit.amount);
        setPrice(invoiceToEdit.price);
      }
    }
  };

  const handleDeleteAcc = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to delete your account.");
      return;
    }

    try {
      await axios.delete(`https://backside-vcwl.onrender.com/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      setMessage("Account deleted successfully.");
      router.push("/");
    } catch (error) {
      setMessage("Failed to delete account.");
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
      const response: AxiosResponse<User> = await axios.patch(
        `https://backside-vcwl.onrender.com/user/${userId}`,
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingEmail(false);
      setShow(false);
      setNewEmail("");
      setCurrentEmail(response.data.email); // Update the current email
      notify("Account Updated Successfully!");
    } catch (error) {
      setMessage("Account With This Email Address Already Exists");
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    router.push("/sign-in");
  };

  const handleFilter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newInvoices = invoices.filter((el) => el.price >= filterPrice);
    setInvoices(newInvoices);
    setMessage("Filtered Successfully");
  };

  const handleSort = () => {
    const sortedInvoices = [...invoices].sort((a, b) =>
      a.description.localeCompare(b.description)
    );
    setInvoices(sortedInvoices);
    setMessage("Sorted Successfully");
  };

  return (
    <div className="">
      <header className="bg-gray-800 h-[60px] flex justify-center items-center">
        <h1 className="text-white font-bold text-2xl">InVoice</h1>
        <div className="cursor-pointer" onClick={() => setShow(!show)}>
          <h3 className="absolute right-[70px] top-[16px] text-white">
            Profile
          </h3>
          <img
            className="w-10 h-10 absolute right-6 top-[10px]"
            src="/images/user.png"
            alt="User"
          />
        </div>
        {show && (
          <div className="pt-[10px] pb-[10px] absolute right-0 w-[200px] flex flex-col justify-center gap-[20px] items-center bg-gray-800 top-[60px] rounded-b-[10px]">
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
              <form
                onSubmit={handleEditEmail}
                className="flex flex-col justify-center items-center gap-2"
              >
                <input
                  className="w-[196px] outline-white outline-solid outline-[1px] bg-gray-800 rounded text-white h-8 m-0 p-[2px]"
                  type="email"
                  value={newEmail}
                  placeholder="example@example.com"
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button
                  className="w-[70px] bg-green-500 text-white rounded-md py-1 px-2 hover:bg-green-600 transition duration-300"
                  type="submit"
                >
                  Save
                </button>
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

      <div
        className="mt-4 mb-4"
        onClick={() => {
          setShow(false), setEditingEmail(false);
        }}
      >
        <div className="p-6 max-w-md mx-auto border-solid border-gray-800 border-2 rounded-[10px]">
          <h1 className="text-2xl font-bold mb-4">Add Invoice</h1>
          <div className="border-[2px] border-black border-solid rounded-xl p-2 flex items-center justify-center gap-4">
            <form onSubmit={handleFilter}>
              <input
                type="number"
                placeholder="Filter By Price"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilterPrice(Math.max(0, Number(e.target.value)))
                }
                className="h-[65px] w-[180px] border rounded-md p-2 outline-sky-700 outline-solid outline-[1px] text-xl"
              />
            </form>
            <button
              onClick={handleSort}
              className="transition duration-300 hover:bg-red-400 text-slate-600 font-bold border-dashed border-[1px] border-red-600 rounded-xl p-2 h-[65.33px] w-[180px]"
            >
              Sort By Name
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <h1 className="text-xl font-bold">Description</h1>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border rounded-md p-2 outline-sky-700 outline-solid outline-[1px]"
              required
            />
            <h1 className="text-xl font-bold">Amount</h1>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              placeholder="Amount"
              className="border rounded-md p-2 outline-sky-700 outline-solid outline-[1px]"
              required
            />
            <h1 className="text-xl font-bold">Price</h1>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              placeholder="Price"
              className="border rounded-md p-2 outline-sky-700 outline-solid outline-[1px]"
              required
            />
            <button
              type="submit"
              className="bg-gray-800 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition duration-300"
            >
              Add Invoice
            </button>
          </form>
          {message && <p className="mt-2 text-slate-600">{message}</p>}
          <h2 className="text-xl font-bold mt-6">Invoices</h2>
          <ul className="mt-2 space-y-2">
            {invoices.map((invoice) => (
              <li key={invoice._id} className="border p-4 rounded-md">
                {editingInvoice === invoice._id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(invoice._id, { description, amount, price });
                    }}
                    className="flex space-x-2 flex-col gap-4 justify-center items-center"
                  >
                    <h1 className="text-l">Description:</h1>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      className="border rounded-md p-2 ml-2"
                      required
                    />
                    <h1 className="text-l">Amount:</h1>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) =>
                        setAmount(Math.max(0, Number(e.target.value)))
                      }
                      placeholder="Amount"
                      className="border rounded-md p-2 m-0"
                      required
                    />
                    <h1 className="text-l">Price:</h1>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) =>
                        setPrice(Math.max(0, Number(e.target.value)))
                      }
                      placeholder="Price"
                      className="border rounded-md p-2"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="w-[70px] bg-green-500 text-white rounded-md py-1 px-2 hover:bg-green-600 transition duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => toggleEditInvoice(invoice._id)}
                        type="button"
                        className="w-[70px] bg-red-500 text-white rounded-md py-1 px-2 hover:bg-red-600 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
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
      <ToastContainer position="top-left" />
    </div>
  );
};

export default HomePage;
