import { useState } from 'react';

export default function CardForm({ accounts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    account_id: accounts.length > 0 ? accounts[0].id : '',
    card_type: 'visa',
    pin: ''
  });
  const [confirmPin, setConfirmPin] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.account_id) {
      newErrors.account_id = 'Veuillez sélectionner un compte';
    }
    
    if (!formData.pin) {
      newErrors.pin = 'Veuillez saisir un code PIN';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'Le code PIN doit contenir 4 chiffres';
    }
    
    if (formData.pin !== confirmPin) {
      newErrors.confirmPin = 'Les codes PIN ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Nouvelle Carte Bancaire</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Compte associé</label>
          <select
            name="account_id"
            value={formData.account_id}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.account_number} - {account.type} ({parseFloat(account.balance).toFixed(2)} €)
              </option>
            ))}
          </select>
          {errors.account_id && <p className="text-red-400 text-sm mt-1">{errors.account_id}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Type de carte</label>
          <select
            name="card_type"
            value={formData.card_type}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Code PIN (4 chiffres)</label>
          <input
            type="password"
            name="pin"
            maxLength="4"
            value={formData.pin}
            onChange={handleChange}
            placeholder="****"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
          {errors.pin && <p className="text-red-400 text-sm mt-1">{errors.pin}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Confirmer le code PIN</label>
          <input
            type="password"
            maxLength="4"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="****"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
          {errors.confirmPin && <p className="text-red-400 text-sm mt-1">{errors.confirmPin}</p>}
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Créer la carte
          </button>
        </div>
      </form>
    </div>
  );
}