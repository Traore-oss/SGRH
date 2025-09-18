/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import api from "../../api/axios.config";

const ForgotAndResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email"); // étape actuelle
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(""); // token temporaire pour réinitialisation
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Étape 1 : vérification de l’email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Endpoint qui renvoie directement un token si l’email existe
      const res = await api.post("/Auth/forgot-password-direct", { email });
      console.log("Réponse serveur:", res.data); 
      setToken(res.data.token);
      setStep("reset");
      setMessage("Email validé. Vous pouvez maintenant saisir votre nouveau mot de passe.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : réinitialisation du mot de passe
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/Auth/reset-password/${token}`, { password });
      setMessage("Mot de passe réinitialisé avec succès !");
      setStep("email"); // optionnel : revenir à l'étape email
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setToken("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-center">
          {step === "email" ? "Mot de passe oublié" : "Réinitialiser le mot de passe"}
        </h2>

        {message && <div className="mb-3 text-green-600 text-sm text-center">{message}</div>}
        {error && <div className="mb-3 text-red-600 text-sm text-center">{error}</div>}

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Votre email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Vérification..." : "Vérifier l'email"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotAndResetPassword;
