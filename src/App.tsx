import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PieChart, 
  List, 
  Filter, 
  Save,
  ArrowDownCircle,
  ArrowUpCircle,
  CloudUpload,
  Leaf,
  AlertTriangle,
  Wifi,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend
} from 'recharts';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query, 
  writeBatch,
  getDocs
} from 'firebase/firestore';

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDiWfZPVVDQqH4WB0ec1lfOU4w3BZ6Xrl0",
  authDomain: "huevos-queens.firebaseapp.com",
  projectId: "huevos-queens",
  storageBucket: "huevos-queens.firebasestorage.app",
  messagingSenderId: "131121347509",
  appId: "1:131121347509:web:575ab564f5eb64e1ccf7fc",
  measurementId: "G-ST2HFRKFLR"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Error inicializando Firebase:", e);
}

const appId = 'huevos-queens-gastos';

// --- DATOS MAESTROS (SEMANAS 1 A 23) ---
const INITIAL_EXPENSES_DATA = [
  // SEMANA 1
  { week: 1, date: '2025-09-05', description: 'Gallinas', amount: 10000, category: 'Aves' },
  { week: 1, date: '2025-09-05', description: 'Cable - Bombillos', amount: 800, category: 'Infraestructura' },
  { week: 1, date: '2025-09-05', description: 'Tubo - Bebederos', amount: 470, category: 'Insumos' },
  { week: 1, date: '2025-09-05', description: 'Lámpara', amount: 180, category: 'Infraestructura' },
  { week: 1, date: '2025-09-05', description: 'Gas - Papel - Cloro', amount: 400, category: 'Otros' },
  { week: 1, date: '2025-09-05', description: 'Tanque - Bloque', amount: 360, category: 'Infraestructura' },
  { week: 1, date: '2025-09-05', description: '10 Bultos Purina', amount: 1000, category: 'Insumos' },
  { week: 1, date: '2025-09-05', description: 'Vacunas', amount: 2700, category: 'Sanidad' },
  { week: 1, date: '2025-09-05', description: 'Planta Eléctrica', amount: 1200, category: 'Infraestructura' },
  { week: 1, date: '2025-09-05', description: 'Cámaras WIFI', amount: 300, category: 'Infraestructura' },
  { week: 1, date: '2025-09-05', description: 'Nómina', amount: 700, category: 'Nómina' },
  // SEMANA 2
  { week: 2, date: '2025-09-12', description: 'Nómina', amount: 500, category: 'Nómina' },
  // SEMANA 3
  { week: 3, date: '2025-09-19', description: '10 Bultos Purina', amount: 1000, category: 'Insumos' },
  { week: 3, date: '2025-09-19', description: 'Plástico Costal', amount: 705, category: 'Infraestructura' },
  { week: 3, date: '2025-09-19', description: 'Plástico', amount: 171, category: 'Infraestructura' },
  { week: 3, date: '2025-09-19', description: 'Lona', amount: 600, category: 'Infraestructura' },
  { week: 3, date: '2025-09-19', description: 'Utensilios', amount: 600, category: 'Otros' },
  { week: 3, date: '2025-09-19', description: 'Vitamina', amount: 100, category: 'Sanidad' },
  { week: 3, date: '2025-09-19', description: 'Nómina', amount: 500, category: 'Nómina' },
  // SEMANA 4
  { week: 4, date: '2025-09-26', description: '13 Bultos Purina', amount: 1189, category: 'Insumos' },
  { week: 4, date: '2025-09-26', description: '3 Bultos Purina', amount: 300, category: 'Insumos' },
  { week: 4, date: '2025-09-26', description: 'Nómina', amount: 600, category: 'Nómina' },
  { week: 4, date: '2025-09-26', description: 'Cámaras (Abono)', amount: 300, category: 'Infraestructura' },
  // SEMANA 5
  { week: 5, date: '2025-10-03', description: '20 Bultos Purina', amount: 1700, category: 'Insumos' },
  { week: 5, date: '2025-10-03', description: 'Máquina - Vitamina', amount: 920, category: 'Otros' },
  { week: 5, date: '2025-10-03', description: 'Nómina', amount: 500, category: 'Nómina' },
  // SEMANA 6
  { week: 6, date: '2025-10-10', description: '30 Bultos Purina', amount: 2450, category: 'Insumos' },
  { week: 6, date: '2025-10-10', description: 'Nómina - Ayudante', amount: 640, category: 'Nómina' },
  // SEMANA 7
  { week: 7, date: '2025-10-17', description: 'Nómina', amount: 550, category: 'Nómina' },
  { week: 7, date: '2025-10-17', description: 'Veterinario', amount: 600, category: 'Sanidad' },
  // SEMANA 8
  { week: 8, date: '2025-10-24', description: 'Tanque - Ladrillo', amount: 447, category: 'Infraestructura' },
  { week: 8, date: '2025-10-24', description: '2 Bultos Purina', amount: 172, category: 'Insumos' },
  { week: 8, date: '2025-10-24', description: '10 Bultos + 13 Lavado', amount: 1885, category: 'Insumos' },
  { week: 8, date: '2025-10-24', description: 'Nómina - Flete', amount: 570, category: 'Nómina' },
  // SEMANA 9
  { week: 9, date: '2025-10-31', description: '10 Bultos Purina', amount: 774, category: 'Insumos' },
  { week: 9, date: '2025-10-31', description: '50 Bultos Purina', amount: 3850, category: 'Insumos' },
  { week: 9, date: '2025-10-31', description: 'Nómina - Ayudantes', amount: 1200, category: 'Nómina' },
  // SEMANA 10
  { week: 10, date: '2025-11-08', description: 'Radio', amount: 180, category: 'Infraestructura' },
  { week: 10, date: '2025-11-08', description: 'Tilosina', amount: 48, category: 'Sanidad' },
  { week: 10, date: '2025-11-08', description: 'Material (Lana)', amount: 60, category: 'Infraestructura' },
  { week: 10, date: '2025-11-08', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 10, date: '2025-11-08', description: 'Vitamina K', amount: 80, category: 'Sanidad' },
  // SEMANA 11
  { week: 11, date: '2025-11-14', description: 'Despicada', amount: 200, category: 'Sanidad' },
  { week: 11, date: '2025-11-14', description: 'Nómina', amount: 550, category: 'Nómina' },
  // SEMANA 12
  { week: 12, date: '2025-11-21', description: 'Cámaras', amount: 350, category: 'Infraestructura' },
  { week: 12, date: '2025-11-21', description: '50 Bultos Purina', amount: 3842, category: 'Insumos' },
  { week: 12, date: '2025-11-21', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 12, date: '2025-11-21', description: 'Flete Purina', amount: 150, category: 'Otros' },
  // SEMANA 13
  { week: 13, date: '2025-11-28', description: 'Ponedoras', amount: 5040, category: 'Aves' },
  { week: 13, date: '2025-11-28', description: 'Flete', amount: 220, category: 'Otros' },
  { week: 13, date: '2025-11-28', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 13, date: '2025-11-28', description: 'Rastrillo', amount: 35, category: 'Infraestructura' },
  // SEMANA 14
  { week: 14, date: '2025-12-05', description: '30 Bultos Purina', amount: 2310, category: 'Insumos' },
  { week: 14, date: '2025-12-05', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 14, date: '2025-12-05', description: 'Fletes y Gastos', amount: 600, category: 'Otros' },
  // SEMANA 15
  { week: 15, date: '2025-12-12', description: 'Nómina y Bonos', amount: 700, category: 'Nómina' },
  { week: 15, date: '2025-12-12', description: 'Fletes y Ayudante', amount: 300, category: 'Otros' },
  { week: 15, date: '2025-12-12', description: '50 Bultos Purina', amount: 3850, category: 'Insumos' },
  { week: 15, date: '2025-12-12', description: 'Retroexcavadora', amount: 4800, category: 'Infraestructura' },
  // SEMANA 16
  { week: 16, date: '2025-12-19', description: 'Nómina y Ayudante', amount: 750, category: 'Nómina' },
  { week: 16, date: '2025-12-19', description: 'Retroexcavadora', amount: 12174, category: 'Infraestructura' },
  // SEMANA 17
  { week: 17, date: '2025-12-26', description: '20 Bultos Purina', amount: 1584, category: 'Insumos' },
  { week: 17, date: '2025-12-26', description: 'Nómina y Ayudante', amount: 650, category: 'Nómina' },
  { week: 17, date: '2025-12-26', description: 'Flete', amount: 150, category: 'Otros' },
  // SEMANA 18
  { week: 18, date: '2026-01-02', description: 'Nómina y Bonos', amount: 600, category: 'Nómina' },
  { week: 18, date: '2026-01-02', description: 'Flete', amount: 120, category: 'Otros' },
  { week: 18, date: '2026-01-02', description: 'Bultos Purina', amount: 2000, category: 'Insumos' },
  // SEMANA 19
  { week: 19, date: '2026-01-09', description: 'Nómina', amount: 740, category: 'Nómina' },
  { week: 19, date: '2026-01-09', description: 'Malla', amount: 330, category: 'Infraestructura' },
  { week: 19, date: '2026-01-09', description: 'Acerrín', amount: 150, category: 'Insumos' },
  { week: 19, date: '2026-01-09', description: 'Internet', amount: 120, category: 'Otros' },
  { week: 19, date: '2026-01-09', description: 'Local', amount: 100, category: 'Otros' },
  { week: 19, date: '2026-01-09', description: 'Transporte', amount: 90, category: 'Otros' },
  { week: 19, date: '2026-01-09', description: 'Sacas', amount: 90, category: 'Insumos' },
  { week: 19, date: '2026-01-09', description: 'Purina Prepico 100 x 100', amount: 7178, category: 'Insumos' },
  // SEMANA 20
  { week: 20, date: '2026-01-16', description: 'Nómina', amount: 740, category: 'Nómina' },
  { week: 20, date: '2026-01-16', description: 'Compra Pollitas Isa Brown', amount: 11050, category: 'Aves' },
  // SEMANA 21
  { week: 21, date: '2026-01-23', description: 'Flete Purina Pato', amount: 356, category: 'Otros' },
  { week: 21, date: '2026-01-23', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 21, date: '2026-01-23', description: 'Insumos Varios', amount: 1050, category: 'Insumos' },
  { week: 21, date: '2026-01-23', description: 'Arena Triturado', amount: 1300, category: 'Infraestructura' },
  { week: 21, date: '2026-01-23', description: 'Purina Pollita Preiniciador x 20', amount: 1597, category: 'Insumos' },
  { week: 21, date: '2026-01-23', description: 'Bloque', amount: 1625, category: 'Infraestructura' },
  { week: 21, date: '2026-01-23', description: 'Purina Prepico 100 x 40', amount: 2582, category: 'Insumos' },
  { week: 21, date: '2026-01-23', description: 'Flejes Cemento Cabilla', amount: 4667, category: 'Infraestructura' },
  // SEMANA 22
  { week: 22, date: '2026-01-30', description: 'Purina Preinicio x 2', amount: 202, category: 'Insumos' },
  { week: 22, date: '2026-01-30', description: 'Nómina Merly', amount: 400, category: 'Nómina' },
  { week: 22, date: '2026-01-30', description: 'Nómina Mayra', amount: 500, category: 'Nómina' },
  { week: 22, date: '2026-01-30', description: 'Gastos Varios', amount: 500, category: 'Insumos' },
  { week: 22, date: '2026-01-30', description: 'Gastos Varios (2)', amount: 815, category: 'Insumos' },
  { week: 22, date: '2026-01-30', description: 'Moto Mantenimiento', amount: 866, category: 'Otros' },
  { week: 22, date: '2026-01-30', description: 'Nómina', amount: 1000, category: 'Nómina' },
  { week: 22, date: '2026-01-30', description: 'Alambre Flejes Cabilla', amount: 1450, category: 'Infraestructura' },
  { week: 22, date: '2026-01-30', description: 'Vacunas Isa Brow', amount: 5000, category: 'Sanidad' },
  { week: 22, date: '2026-01-30', description: 'Nómina Junior', amount: 7000, category: 'Nómina' },
  // SEMANA 23
  { week: 23, date: '2026-02-06', description: 'Nómina Merly', amount: 400, category: 'Nómina' },
  { week: 23, date: '2026-02-06', description: 'Flete Rómulo', amount: 420, category: 'Otros' },
  { week: 23, date: '2026-02-06', description: 'Cemento', amount: 825, category: 'Infraestructura' },
  { week: 23, date: '2026-02-06', description: 'Nómina Samuel', amount: 1000, category: 'Nómina' },
  { week: 23, date: '2026-02-06', description: 'Soldador', amount: 2000, category: 'Infraestructura' }
];

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#6366F1'];

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Insumos': return <div className="p-2 bg-yellow-100 rounded-lg"><Leaf className="w-5 h-5 text-yellow-600" /></div>;
    case 'Nómina': return <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>;
    case 'Infraestructura': return <div className="p-2 bg-blue-100 rounded-lg"><ArrowDownCircle className="w-5 h-5 text-blue-600" /></div>;
    case 'Aves': return <div className="p-2 bg-red-100 rounded-lg"><ArrowUpCircle className="w-5 h-5 text-red-600" /></div>;
    case 'Sanidad': return <div className="p-2 bg-purple-100 rounded-lg"><Plus className="w-5 h-5 text-purple-600" /></div>;
    default: return <div className="p-2 bg-gray-100 rounded-lg"><List className="w-5 h-5 text-gray-600" /></div>;
  }
};

// Componentes UI Simples
const Card = ({ children, className }: any) => <div className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={`px-6 py-4 border-b border-gray-50 bg-gray-50/50 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-bold text-gray-800 ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={`p-6 ${className}`}>{children}</div>;

export default function HuevosQueensExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  
  // Estado para controlar qué semanas están expandidas
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);

  const toggleWeek = (week: number) => {
    if (expandedWeeks.includes(week)) {
      setExpandedWeeks(expandedWeeks.filter(w => w !== week));
    } else {
      setExpandedWeeks([...expandedWeeks, week]);
    }
  };
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    week: '',
    description: '',
    amount: '',
    category: 'Insumos'
  });

  useEffect(() => {
    document.title = "Gastos Huevos Queens 👑";
  }, []);

  // Auth y Conexión
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        setAuthError("No se pudo iniciar Firebase. Revisa la consola.");
        return;
    }
    
    const login = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err: any) {
        console.error("Login error:", err);
        if (err.code === 'auth/admin-restricted-operation' || err.message.includes('domain')) {
          setAuthError(`⚠️ DOMINIO NO AUTORIZADO ⚠️\n\nVe a Firebase -> Authentication -> Settings -> Authorized Domains\nAgrega: ${window.location.hostname}`);
        } else {
          setAuthError("Error de conexión: " + err.message);
        }
        setLoading(false);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError(null);
        setStatus('connected');
      } else {
        setStatus('connecting');
        login();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Carga de Datos (Ruta Compartida PÚBLICA)
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
      setLoading(false);
      setStatus('connected');
    }, (error) => {
      console.error("Error:", error);
      setStatus('offline');
    });

    return () => unsubscribe();
  }, []);

  const resetAndUploadData = async () => {
    if (!db) return;
    if (!confirm('⚠️ ¿Estás seguro de restaurar los datos?\n\nEsto borrará los datos actuales y cargará las Semanas 1 a 23 desde el código. \n\nÚsalo solo para sincronizar datos faltantes.')) return;
    
    setIsUploading(true);
    try {
      const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
      
      const snapshot = await getDocs(collectionRef);
      const batchDelete = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batchDelete.delete(doc.ref);
      });
      await batchDelete.commit();

      const batchAdd = writeBatch(db);
      INITIAL_EXPENSES_DATA.forEach(item => {
        const docRef = doc(collectionRef);
        batchAdd.set(docRef, item);
      });
      await batchAdd.commit();
      
      alert('¡Sincronización Completa! 🎉\n\nSe han cargado todas las semanas (1-23).');
    } catch (error: any) {
      console.error(error);
      alert('Error en la sincronización: ' + error.message);
    }
    setIsUploading(false);
  };

  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [expenses]);
  
  const byCategory = useMemo(() => {
    const data: any = {};
    expenses.forEach(item => {
      if (!data[item.category]) data[item.category] = 0;
      data[item.category] += Number(item.amount);
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [expenses]);

  const byWeek = useMemo(() => {
    const data: any = {};
    expenses.forEach(item => {
      const key = `Sem ${item.week}`;
      if (!data[key]) data[key] = 0;
      data[key] += Number(item.amount);
    });
    return Object.keys(data)
      .sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
      .map(key => ({ name: key, total: data[key] }));
  }, [expenses]);

  const expensesByWeek = useMemo(() => {
    const grouped: any = {};
    expenses.forEach(exp => {
      const w = exp.week || 0;
      if (!grouped[w]) grouped[w] = [];
      grouped[w].push(exp);
    });
    return grouped;
  }, [expenses]);

  const sortedWeeks = useMemo(() => {
    return Object.keys(expensesByWeek).sort((a, b) => Number(b) - Number(a));
  }, [expensesByWeek]);

  const handleAddExpense = async (e: any) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
        ...newExpense,
        amount: Number(newExpense.amount),
        week: Number(newExpense.week || 19),
        createdAt: new Date(),
        device: navigator.userAgent 
      });
      setNewExpense({ ...newExpense, description: '', amount: '' });
      setView('list');
      if (newExpense.week) {
          const w = Number(newExpense.week);
          if (!expandedWeeks.includes(w)) setExpandedWeeks(prev => [...prev, w]);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Verifica tu conexión.");
    }
    setIsSaving(false);
  };

  const deleteExpense = async (id: string) => {
    if (!db) return;
    if (confirm('¿Borrar gasto?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
    }
  };

  const displayAmount = (val: number) => new Intl.NumberFormat('es-CO').format(val);

  if (loading || authError) {
      return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6 text-center">
             {authError ? (
                 <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md border-l-4 border-red-500">
                     <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                     <h3 className="font-bold text-gray-800 text-lg mb-2">Acceso Restringido</h3>
                     <p className="text-gray-600 text-sm whitespace-pre-line text-left">{authError}</p>
                 </div>
             ) : (
                <div className="animate-pulse text-emerald-600 font-medium flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    Conectando con la Nube...
                </div>
             )}
        </div>
      );
  } 

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header Verde */}
      <div className="bg-emerald-600 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Leaf size={140} /></div>
        
        {/* Barra de Estado y Botón Restaurar */}
        <div className="absolute top-4 right-6 flex items-center gap-2 z-20">
            <button 
                onClick={resetAndUploadData}
                disabled={isUploading}
                className="bg-emerald-800/40 backdrop-blur-sm text-emerald-50 p-2 rounded-full border border-emerald-400/30 hover:bg-emerald-700/50 transition-colors"
                title="Sincronizar y Restaurar Datos"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
            </button>

            {status === 'connected' ? (
                <span className="bg-emerald-800/40 backdrop-blur-sm text-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                    En Línea
                </span>
            ) : (
                <span className="bg-red-800/40 backdrop-blur-sm text-red-50 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-red-400/30">
                    <Wifi className="w-3 h-3" />
                    Offline
                </span>
            )}
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Huevos Queens 👑</h1>
          <p className="text-emerald-100 mb-6 font-medium">Control de Costos (V2)</p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <span className="text-emerald-50 text-xs font-bold uppercase tracking-wider">Total Gastado</span>
            <div className="text-4xl font-extrabold mt-2">${displayAmount(totalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* Menú Flotante */}
      <div className="relative z-20 -mt-8 mb-8 px-4">
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex justify-between max-w-sm mx-auto">
          {['dashboard', 'list', 'add'].map((v) => (
            <button 
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${view === v ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {v === 'dashboard' ? 'Resumen' : v === 'list' ? 'Historial' : '+ Nuevo'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
        {/* Botón Carga Inicial (Solo si está vacío) */}
        {expenses.length === 0 && !loading && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader className="bg-transparent border-none pb-0">
                <CardTitle className="text-emerald-800">¡Bienvenido!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-700 mb-4">
                La base de datos está vacía. Carga los datos actualizados (Semana 1-23) para sincronizar todos tus dispositivos.
              </p>
              <button onClick={uploadInitialData} disabled={isUploading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-emerald-700 transition-colors">
                {isUploading ? <Loader2 className="animate-spin"/> : <CloudUpload size={20}/>} 
                {isUploading ? 'Subiendo...' : 'Cargar Todo (Sem 1-23)'}
              </button>
            </CardContent>
          </Card>
        )}

        {view === 'dashboard' && expenses.length > 0 && (
          <>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="text-emerald-500"/> Por Categoría</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={byCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {byCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: any) => displayAmount(value)} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-emerald-500"/> Gasto Semanal</CardTitle></CardHeader>
              <CardContent>
                 <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byWeek.slice(-8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val: any) => `$${val/1000}k`} />
                      <Tooltip formatter={(value: any) => displayAmount(value)} cursor={{fill: '#ECFDF5'}} />
                      <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {view === 'list' && (
           <div className="space-y-4 pb-20">
             {expenses.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                 <p>No hay datos. Dale al botón 🔄 arriba para cargar.</p>
               </div>
             )}
             
             {sortedWeeks.map((weekNum: any) => {
               const weekTotal = expensesByWeek[weekNum].reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
               const isExpanded = expandedWeeks.includes(Number(weekNum));
               
               return (
                 <div key={weekNum} className="rounded-xl overflow-hidden shadow-sm border border-emerald-100 bg-white transition-all duration-200">
                   <button 
                    onClick={() => toggleWeek(Number(weekNum))}
                    className={`w-full flex justify-between items-center p-4 transition-colors ${isExpanded ? 'bg-emerald-50/50' : 'bg-white hover:bg-gray-50'}`}
                   >
                     <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${isExpanded ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                         {weekNum}
                       </div>
                       <div className="text-left">
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Semana {weekNum}</p>
                         <p className="text-emerald-800 font-extrabold text-lg">${displayAmount(weekTotal)}</p>
                       </div>
                     </div>
                     {isExpanded ? <ChevronUp className="text-emerald-500"/> : <ChevronDown className="text-gray-300"/>}
                   </button>
                   
                   {isExpanded && (
                     <div className="bg-gray-50/30 border-t border-emerald-100 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                       {expensesByWeek[weekNum].map((expense: any) => (
                         <div key={expense.id} className="bg-white p-3.5 rounded-xl border border-gray-100 flex justify-between items-center ml-2 shadow-sm relative group">
                            <div className="flex items-center gap-3">
                              <CategoryIcon category={expense.category} />
                              <div>
                                <h4 className="font-bold text-gray-700 text-sm leading-tight">{expense.description}</h4>
                                <span className="text-[10px] text-gray-400 font-medium">{expense.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-700 text-sm">${displayAmount(expense.amount)}</div>
                              <button onClick={() => deleteExpense(expense.id)} className="text-red-300 hover:text-red-500 p-1.5 -mr-1 transition-colors"><Trash2 size={14} /></button>
                            </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        )}

        {view === 'add' && (
          <Card>
            <CardHeader className="bg-emerald-600 text-white rounded-t-xl"><CardTitle className="text-white text-center">Nuevo Gasto</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha</label>
                  <input type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Semana</label>
                    <input type="number" placeholder="Ej: 19" value={newExpense.week} onChange={e => setNewExpense({...newExpense, week: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Monto</label>
                    <input type="number" required placeholder="$0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"/>
                  </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Concepto</label>
                    <input type="text" required placeholder="Ej: Purina Inicio" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Categoría</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Insumos', 'Nómina', 'Infraestructura', 'Sanidad', 'Aves', 'Otros'].map(cat => (
                            <button key={cat} type="button" onClick={() => setNewExpense({...newExpense, category: cat})} className={`text-xs py-2 rounded-lg border transition-all ${newExpense.category === cat ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold scale-105' : 'bg-white text-gray-500'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg mt-2 flex justify-center items-center gap-2 hover:bg-emerald-700 transition-colors">
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                    {isSaving ? 'Guardando...' : 'Guardar Gasto'}
                </button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}