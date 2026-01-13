import React, { useState } from 'react';
import { X, Key, FileSignature } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

interface ConfirmationModalProps {
  title: string;
  expectedCode: string; // Code généré pour cette action
  onConfirm: (data: { code?: string; signature?: string }) => void;
  onCancel: () => void;
  type: 'pickup' | 'delivery';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  expectedCode,
  onConfirm,
  onCancel,
  type
}) => {
  const [method, setMethod] = useState<'code' | 'signature' | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const handleCodeSubmit = () => {
    const trimmedCode = codeInput.trim().toUpperCase();
    
    if (!trimmedCode) {
      setCodeError('Veuillez saisir le code');
      return;
    }

    if (trimmedCode !== expectedCode) {
      setCodeError('Code incorrect. Veuillez réessayer.');
      return;
    }

    // Code valide
    onConfirm({ code: trimmedCode });
  };

  const handleSignatureSave = (signature: string) => {
    setShowSignaturePad(false);
    onConfirm({ signature });
  };

  if (showSignaturePad) {
    return (
      <SignaturePad
        onSave={handleSignatureSave}
        onCancel={() => setShowSignaturePad(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!method ? (
            // Choix de la méthode
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Choisissez une méthode de confirmation :
              </p>
              
              <button
                onClick={() => setMethod('code')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Key className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Code de confirmation</div>
                  <div className="text-sm text-gray-500">
                    {type === 'pickup' ? 'Code donné par le fournisseur' : 'Code donné par le destinataire'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowSignaturePad(true)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-3"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileSignature className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Signature manuscrite</div>
                  <div className="text-sm text-gray-500">
                    {type === 'pickup' ? 'Signature du fournisseur' : 'Signature du destinataire'}
                  </div>
                </div>
              </button>
            </div>
          ) : (
            // Saisie du code
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  <Key className="h-4 w-4" />
                  Méthode : Code de confirmation
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de confirmation
                </label>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value.toUpperCase());
                    setCodeError('');
                  }}
                  placeholder="Exemple: ABC123"
                  maxLength={6}
                  className={`w-full px-4 py-3 text-center text-2xl font-mono border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    codeError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoFocus
                />
                {codeError && (
                  <p className="mt-2 text-sm text-red-600">{codeError}</p>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Demandez le code à {type === 'pickup' ? 'votre contact chez le fournisseur' : 'la personne qui réceptionne'}
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMethod(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Retour
                </button>
                <button
                  onClick={handleCodeSubmit}
                  disabled={!codeInput.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
