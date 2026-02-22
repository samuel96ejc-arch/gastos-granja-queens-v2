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
  ChevronUp,
  Lock,
  LogOut,
  Pencil
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
  signInWithEmailAndPassword,
  signOut
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
  getDocs,
  updateDoc
} from 'firebase/firestore';

// --- CONFIGURACIÓN FIREBASE (AHORA SEGURA) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
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
  { week: 2, date: '2025-09-12', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 3, date: '2025-09-19', description: '10 Bultos Purina', amount: 1000, category: 'Insumos' },
  { week: 3, date: '2025-09-19', description: 'Plástico Costal', amount: 705, category: 'Infraestructura' },
  { week: 3, date: '2025-09-19', description: 'Plástico', amount: 171, category: 'Infraestructura' },
  { week: 3, date: '2025-09-19', description: 'Lona', amount: 600, category: 'Infraestructura' },
  { week: 3, date: '2025-09-19', description: 'Utensilios', amount: 600, category: 'Otros' },
  { week: 3, date: '2025-09-19', description: 'Vitamina', amount: 100, category: 'Sanidad' },
  { week: 3, date: '2025-09-19', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 4, date: '2025-09-26', description: '13 Bultos Purina', amount: 1189, category: 'Insumos' },
  { week: 4, date: '2025-09-26', description: '3 Bultos Purina', amount: 300, category: 'Insumos' },
  { week: 4, date: '2025-09-26', description: 'Nómina', amount: 600, category: 'Nómina' },
  { week: 4, date: '2025-09-26', description: 'Cámaras (Abono)', amount: 300, category: 'Infraestructura' },
  { week: 5, date: '2025-10-03', description: '20 Bultos Purina', amount: 1700, category: 'Insumos' },
  { week: 5, date: '2025-10-03', description: 'Máquina - Vitamina', amount: 920, category: 'Otros' },
  { week: 5, date: '2025-10-03', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 6, date: '2025-10-10', description: '30 Bultos Purina', amount: 2450, category: 'Insumos' },
  { week: 6, date: '2025-10-10', description: 'Nómina - Ayudante', amount: 640, category: 'Nómina' },
  { week: 7, date: '2025-10-17', description: 'Nómina', amount: 550, category: 'Nómina' },
  { week: 7, date: '2025-10-17', description: 'Veterinario', amount: 600, category: 'Sanidad' },
  { week: 8, date: '2025-10-24', description: 'Tanque - Ladrillo', amount: 447, category: 'Infraestructura' },
  { week: 8, date: '2025-10-24', description: '2 Bultos Purina', amount: 172, category: 'Insumos' },
  { week: 8, date: '2025-10-24', description: '10 Bultos + 13 Lavado', amount: 1885, category: 'Insumos' },
  { week: 8, date: '2025-10-24', description: 'Nómina - Flete', amount: 570, category: 'Nómina' },
  { week: 9, date: '2025-10-31', description: '10 Bultos Purina', amount: 774, category: 'Insumos' },
  { week: 9, date: '2025-10-31', description: '50 Bultos Purina', amount: 3850, category: 'Insumos' },
  { week: 9, date: '2025-10-31', description: 'Nómina - Ayudantes', amount: 1200, category: 'Nómina' },
  { week: 10, date: '2025-11-08', description: 'Radio', amount: 180, category: 'Infraestructura' },
  { week: 10, date: '2025-11-08', description: 'Tilosina', amount: 48, category: 'Sanidad' },
  { week: 10, date: '2025-11-08', description: 'Material (Lana)', amount: 60, category: 'Infraestructura' },
  { week: 10, date: '2025-11-08', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 10, date: '2025-11-08', description: 'Vitamina K', amount: 80, category: 'Sanidad' },
  { week: 11, date: '2025-11-14', description: 'Despicada', amount: 200, category: 'Sanidad' },
  { week: 11, date: '2025-11-14', description: 'Nómina', amount: 550, category: 'Nómina' },
  { week: 12, date: '2025-11-21', description: 'Cámaras', amount: 350, category: 'Infraestructura' },
  { week: 12, date: '2025-11-21', description: '50 Bultos Purina', amount: 3842, category: 'Insumos' },
  { week: 12, date: '2025-11-21', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 12, date: '2025-11-21', description: 'Flete Purina', amount: 150, category: 'Otros' },
  { week: 13, date: '2025-11-28', description: 'Ponedoras', amount: 5040, category: 'Aves' },
  { week: 13, date: '2025-11-28', description: 'Flete', amount: 220, category: 'Otros' },
  { week: 13, date: '2025-11-28', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 13, date: '2025-11-28', description: 'Rastrillo', amount: 35, category: 'Infraestructura' },
  { week: 14, date: '2025-12-05', description: '30 Bultos Purina', amount: 2310, category: 'Insumos' },
  { week: 14, date: '2025-12-05', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 14, date: '2025-12-05', description: 'Fletes y Gastos', amount: 600, category: 'Otros' },
  { week: 15, date: '2025-12-12', description: 'Nómina y Bonos', amount: 700, category: 'Nómina' },
  { week: 15, date: '2025-12-12', description: 'Fletes y Ayudante', amount: 300, category: 'Otros' },
  { week: 15, date: '2025-12-12', description: '50 Bultos Purina', amount: 3850, category: 'Insumos' },
  { week: 15, date: '2025-12-12', description: 'Retroexcavadora', amount: 4800, category: 'Infraestructura' },
  { week: 16, date: '2025-12-19', description: 'Nómina y Ayudante', amount: 750, category: 'Nómina' },
  { week: 16, date: '2025-12-19', description: 'Retroexcavadora', amount: 12174, category: 'Infraestructura' },
  { week: 17, date: '2025-12-26', description: '20 Bultos Purina', amount: 1584, category: 'Insumos' },
  { week: 17, date: '2025-12-26', description: 'Nómina y Ayudante', amount: 650, category: 'Nómina' },
  { week: 17, date: '2025-12-26', description: 'Flete', amount: 150, category: 'Otros' },
  { week: 18, date: '2026-01-02', description: 'Nómina y Bonos', amount: 600, category: 'Nómina' },
  { week: 18, date: '2026-01-02', description: 'Flete', amount: 120, category: 'Otros' },
  { week: 18, date: '2026-01-02', description: 'Bultos Purina', amount: 2000, category: 'Insumos' },
  { week: 19, date: '2026-01-09', description: 'Nómina', amount: 740, category: 'Nómina' },
  { week: 19, date: '2026-01-09', description: 'Malla', amount: 330, category: 'Infraestructura' },
  { week: 19, date: '2026-01-09', description: 'Acerrín', amount: 150, category: 'Insumos' },
  { week: 19, date: '2026-01-09', description: 'Internet', amount: 120, category: 'Otros' },
  { week: 19, date: '2026-01-09', description: 'Local', amount: 100, category: 'Otros' },
  { week: 19, date: '2026-01-09', description: 'Transporte', amount: 90, category: 'Otros' },
  { week: 19, date: '2026-01-09', description: 'Sacas', amount: 90, category: 'Insumos' },
  { week: 19, date: '2026-01-09', description: 'Purina Prepico 100 x 100', amount: 7178, category: 'Insumos' },
  { week: 20, date: '2026-01-16', description: 'Nómina', amount: 740, category: 'Nómina' },
  { week: 20, date: '2026-01-16', description: 'Compra Pollitas Isa Brown', amount: 11050, category: 'Aves' },
  { week: 21, date: '2026-01-23', description: 'Flete Purina Pato', amount: 356, category: 'Otros' },
  { week: 21, date: '2026-01-23', description: 'Nómina', amount: 500, category: 'Nómina' },
  { week: 21, date: '2026-01-23', description: 'Insumos Varios', amount: 1050, category: 'Insumos' },
  { week: 21, date: '2026-01-23', description: 'Arena Triturado', amount: 1300, category: 'Infraestructura' },
  { week: 21, date: '2026-01-23', description: 'Purina Pollita Preiniciador x 20', amount: 1597, category: 'Insumos' },
  { week: 21, date: '2026-01-23', description: 'Bloque', amount: 1625, category: 'Infraestructura' },
  { week: 21, date: '2026-01-23', description: 'Purina Prepico 100 x 40', amount: 2582, category: 'Insumos' },
  { week: 21, date: '2026-01-23', description: 'Flejes Cemento Cabilla', amount: 4667, category: 'Infraestructura' },
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
  { week: 23, date: '2026-02-06', description: 'Nómina Merly', amount: 400, category: 'Nómina' },
  { week: 23, date: '2026-02-06', description: 'Flete Rómulo', amount: 420, category: 'Otros' },
  { week: 23, date: '2026-02-06', description: 'Cemento', amount: 825, category: 'Infraestructura' },
  { week: 23, date: '2026-02-06', description: 'Nómina Samuel', amount: 1000, category: 'Nómina' },
  { week: 23, date: '2026-02-06', description: 'Soldador', amount: 2000, category: 'Infraestructura' }
];

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#6366F1'];

const CategoryIcon = ({ category, isIncome }: { category: string, isIncome?: boolean }) => {
  if (isIncome) {
      return <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>;
  }
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
  const [status, setStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  
  // ESTADOS PARA EL LOGIN Y SEGURIDAD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ESTADO PARA EDITAR
  const [editingExpense, setEditingExpense] = useState<any>(null);

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

  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    week: '',
    description: '',
    amount: '',
    category: 'Efectivo'
  });

  useEffect(() => {
    document.title = "Huevos Queens 👑";
  }, []);

  // --- Auth y Conexión Segura ---
  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus('connected');
      } else {
        setStatus('offline');
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // --- Carga de Datos ---
  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
      setStatus('connected');
    }, (error) => {
      console.error("Error:", error);
      setStatus('offline');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        setLoginError("Correo o contraseña incorrectos");
        setIsLoggingIn(false);
      });
  };

  const handleLogout = () => {
    signOut(auth);
  };

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
      
      alert('¡Sincronización Completa! 🎉');
    } catch (error: any) {
      console.error(error);
      alert('Error en la sincronización: ' + error.message);
    }
    setIsUploading(false);
  };

  const uploadInitialData = resetAndUploadData;

  // --- CÁLCULOS DE GASTOS E INGRESOS ---
  const expensesOnly = useMemo(() => expenses.filter(e => e.type !== 'income'), [expenses]);
  const incomesOnly = useMemo(() => expenses.filter(e => e.type === 'income'), [expenses]);

  const totalExpenses = useMemo(() => expensesOnly.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [expensesOnly]);
  const totalIncome = useMemo(() => incomesOnly.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [incomesOnly]);
  
  const byCategory = useMemo(() => {
    const data: any = {};
    expensesOnly.forEach(item => {
      if (!data[item.category]) data[item.category] = 0;
      data[item.category] += Number(item.amount);
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [expensesOnly]);

  const byWeek = useMemo(() => {
    const data: any = {};
    expensesOnly.forEach(item => {
      const key = `Sem ${item.week}`;
      if (!data[key]) data[key] = 0;
      data[key] += Number(item.amount);
    });
    return Object.keys(data)
      .sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
      .map(key => ({ name: key, total: data[key] }));
  }, [expensesOnly]);

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

  // --- GUARDAR GASTO ---
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
      alert("Error al guardar.");
    }
    setIsSaving(false);
  };

  // --- GUARDAR INGRESO ---
  const handleAddIncome = async (e: any) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
        ...newIncome,
        type: 'income',
        amount: Number(newIncome.amount),
        week: Number(newIncome.week || 19),
        createdAt: new Date(),
        device: navigator.userAgent 
      });
      setNewIncome({ ...newIncome, description: '', amount: '' });
      setView('list');
      if (newIncome.week) {
          const w = Number(newIncome.week);
          if (!expandedWeeks.includes(w)) setExpandedWeeks(prev => [...prev, w]);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar el ingreso.");
    }
    setIsSaving(false);
  };

  const deleteExpense = async (id: string) => {
    if (!db) return;
    if (confirm('¿Borrar este registro permanentemente?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
    }
  };

  // --- LÓGICA DE EDICIÓN ---
  const openEdit = (exp: any) => {
    setEditingExpense({
      ...exp,
      editDate: exp.date || '',
      editWeek: exp.week || '',
      editAmount: exp.amount || '',
      editDesc: exp.description || '',
      editCategory: exp.category || (exp.type === 'income' ? 'Efectivo' : 'Insumos')
    });
  };

  const handleUpdateExpense = async (e: any) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    try {
      const updatedData = {
        date: editingExpense.editDate,
        week: Number(editingExpense.editWeek),
        amount: Number(editingExpense.editAmount),
        description: editingExpense.editDesc,
        category: editingExpense.editCategory
      };
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', editingExpense.id), updatedData);
      setEditingExpense(null);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar.");
    }
    setIsSaving(false);
  };

  const displayAmount = (val: number) => new Intl.NumberFormat('es-CO').format(val);

  // --- PANTALLAS ---

  if (loading) {
      return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6 text-center">
            <div className="animate-pulse text-emerald-600 font-medium flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                Conectando...
            </div>
        </div>
      );
  } 

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-500 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Lock className="w-24 h-24 text-white" /></div>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-4 relative z-10">
              <Leaf className="w-10 h-10 text-emerald-600"/>
            </div>
            <h1 className="text-2xl font-black text-white relative z-10 uppercase tracking-wide">Huevos Queens</h1>
            <p className="text-emerald-200 text-sm mt-1 relative z-10">Acceso Privado</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Correo Electrónico</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 font-medium" placeholder="usuario@correo.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Contraseña</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 font-medium" placeholder="••••••••" />
              </div>
              {loginError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">{loginError}</p>}
              <button type="submit" disabled={isLoggingIn} className="w-full bg-yellow-400 hover:bg-yellow-500 text-emerald-900 font-black py-4 rounded-xl shadow-md transition-all mt-4">
                {isLoggingIn ? 'Verificando...' : 'ENTRAR'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header Verde */}
      <div className="bg-emerald-600 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Leaf size={140} /></div>
        
        {/* Barra de Estado */}
        <div className="absolute top-4 right-6 flex items-center gap-2 z-20">
            <button 
                onClick={resetAndUploadData}
                disabled={isUploading}
                className="bg-emerald-800/40 backdrop-blur-sm text-emerald-50 p-2 rounded-full border border-emerald-400/30 hover:bg-emerald-700/50 transition-colors"
                title="Sincronizar y Restaurar Datos"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
            </button>
            <button 
                onClick={handleLogout}
                className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full border border-red-400/30 hover:bg-red-600 transition-colors shadow-sm"
                title="Cerrar Sesión"
            >
                <LogOut className="w-4 h-4"/>
            </button>
        </div>

        <div className="relative z-10 mt-2">
          <h1 className="text-2xl font-bold mb-1">Huevos Queens 👑</h1>
          <p className="text-emerald-100 mb-6 font-medium">Control y Balance (V2)</p>
          
          {/* TABLERO DE BALANCE */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
               <div>
                   <span className="text-emerald-50 text-[10px] font-bold uppercase tracking-wider">Total Gastado</span>
                   <div className="text-2xl font-extrabold mt-1 text-red-200">-${displayAmount(totalExpenses)}</div>
               </div>
               <div className="text-right">
                   <span className="text-emerald-50 text-[10px] font-bold uppercase tracking-wider">Total Ganado</span>
                   <div className="text-2xl font-extrabold mt-1 text-blue-200">+${displayAmount(totalIncome)}</div>
               </div>
            </div>
            <div className="text-center">
               <span className="text-emerald-50 text-xs font-bold uppercase tracking-wider">Balance Actual</span>
               <div className={`text-4xl font-black mt-1 ${totalIncome - totalExpenses >= 0 ? 'text-white' : 'text-yellow-300'}`}>
                 ${displayAmount(totalIncome - totalExpenses)}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú Flotante */}
      <div className="relative z-20 -mt-8 mb-8 px-4">
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex justify-between max-w-lg mx-auto overflow-x-auto gap-2">
          <button onClick={() => setView('dashboard')} className={`flex-1 min-w-[70px] py-3 rounded-xl text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>Resumen</button>
          <button onClick={() => setView('list')} className={`flex-1 min-w-[70px] py-3 rounded-xl text-xs font-bold transition-all ${view === 'list' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>Historial</button>
          <button onClick={() => setView('add')} className={`flex-1 min-w-[70px] py-3 rounded-xl text-xs font-bold transition-all ${view === 'add' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>- Gasto</button>
          <button onClick={() => setView('addIncome')} className={`flex-1 min-w-[70px] py-3 rounded-xl text-xs font-bold transition-all ${view === 'addIncome' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>+ Ingreso</button>
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
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
              <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="text-emerald-500"/> Gastos Por Categoría</CardTitle></CardHeader>
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
               // Filtrar gastos e ingresos de esta semana
               const weekExpenses = expensesByWeek[weekNum].filter((e:any) => e.type !== 'income').reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
               const weekIncome = expensesByWeek[weekNum].filter((e:any) => e.type === 'income').reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
               
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
                         <div className="flex gap-3 text-sm mt-0.5">
                            {weekExpenses > 0 && <span className="text-red-500 font-bold">-{displayAmount(weekExpenses)}</span>}
                            {weekIncome > 0 && <span className="text-blue-600 font-bold">+{displayAmount(weekIncome)}</span>}
                         </div>
                       </div>
                     </div>
                     {isExpanded ? <ChevronUp className="text-emerald-500"/> : <ChevronDown className="text-gray-300"/>}
                   </button>
                   
                   {isExpanded && (
                     <div className="bg-gray-50/30 border-t border-emerald-100 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                       {expensesByWeek[weekNum].map((expense: any) => {
                         const isIncome = expense.type === 'income';
                         return (
                           <div key={expense.id} className={`bg-white p-3.5 rounded-xl border flex justify-between items-center shadow-sm relative group transition-colors ${isIncome ? 'border-blue-100 hover:bg-blue-50/30' : 'border-red-50 hover:bg-red-50/30'}`}>
                              <div className="flex items-center gap-3 w-2/3">
                                <CategoryIcon category={expense.category} isIncome={isIncome} />
                                <div>
                                  <h4 className="font-bold text-gray-700 text-sm leading-tight pr-2">{expense.description}</h4>
                                  <span className="text-[10px] text-gray-400 font-medium">{expense.date} • {expense.category}</span>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div className={`font-bold text-sm ${isIncome ? 'text-blue-600' : 'text-red-500'}`}>
                                  {isIncome ? '+' : '-'}${displayAmount(expense.amount)}
                                </div>
                                <div className="flex flex-col gap-1 border-l pl-2 border-gray-100">
                                  <button onClick={() => openEdit(expense)} className={`p-1 rounded transition-colors ${isIncome ? 'text-blue-300 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-300 hover:text-emerald-600 hover:bg-emerald-50'}`}><Pencil size={14} /></button>
                                  <button onClick={() => deleteExpense(expense.id)} className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                                </div>
                              </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        )}

        {/* --- FORMULARIO GASTOS --- */}
        {view === 'add' && (
          <Card>
            <CardHeader className="bg-red-500 text-white rounded-t-xl"><CardTitle className="text-white text-center">Registrar Gasto</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha</label>
                  <input type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Semana</label>
                    <input type="number" placeholder="Ej: 19" value={newExpense.week} onChange={e => setNewExpense({...newExpense, week: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Monto Gastado</label>
                    <input type="number" required placeholder="$0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"/>
                  </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Concepto</label>
                    <input type="text" required placeholder="Ej: Purina Inicio" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Categoría del Gasto</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Insumos', 'Nómina', 'Infraestructura', 'Sanidad', 'Aves', 'Otros'].map(cat => (
                            <button key={cat} type="button" onClick={() => setNewExpense({...newExpense, category: cat})} className={`text-xs py-2 rounded-lg border transition-all ${newExpense.category === cat ? 'bg-red-100 border-red-500 text-red-800 font-bold scale-105' : 'bg-white text-gray-500'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg mt-2 flex justify-center items-center gap-2 hover:bg-red-600 transition-colors">
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                    {isSaving ? 'Guardando...' : 'Guardar Gasto'}
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* --- FORMULARIO INGRESOS (NUEVO) --- */}
        {view === 'addIncome' && (
          <Card>
            <CardHeader className="bg-blue-600 text-white rounded-t-xl"><CardTitle className="text-white text-center">Registrar Ganancia (Ingreso)</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddIncome} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha</label>
                  <input type="date" required value={newIncome.date} onChange={e => setNewIncome({...newIncome, date: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Semana</label>
                    <input type="number" placeholder="Ej: 19" value={newIncome.week} onChange={e => setNewIncome({...newIncome, week: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Monto Ganado</label>
                    <input type="number" required placeholder="$0" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Concepto</label>
                    <input type="text" required placeholder="Ej: Venta de huevos" value={newIncome.description} onChange={e => setNewIncome({...newIncome, description: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Medio de Pago</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Efectivo', 'Nequi', 'Bancolombia', 'Daviplata', 'Otro'].map(cat => (
                            <button key={cat} type="button" onClick={() => setNewIncome({...newIncome, category: cat})} className={`text-xs py-2 rounded-lg border transition-all ${newIncome.category === cat ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold scale-105' : 'bg-white text-gray-500'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg mt-2 flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
                    {isSaving ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                    {isSaving ? 'Guardando...' : 'Guardar Ingreso'}
                </button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- MODAL PARA EDITAR GASTO/INGRESO --- */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border-t-8 border-emerald-500">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-emerald-900 uppercase">
                        {editingExpense.type === 'income' ? 'Editar Ingreso' : 'Editar Gasto'}
                    </h3>
                    <button onClick={() => setEditingExpense(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="text-gray-500 w-5 h-5" /></button>
                </div>
                <form onSubmit={handleUpdateExpense} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Fecha</label>
                        <input type="date" value={editingExpense.editDate} onChange={e => setEditingExpense({...editingExpense, editDate: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50 font-bold text-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Semana</label>
                            <input type="number" value={editingExpense.editWeek} onChange={e => setEditingExpense({...editingExpense, editWeek: e.target.value})} className="w-full p-3 border rounded-xl text-center" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Monto ($)</label>
                            <input type="number" value={editingExpense.editAmount} onChange={e => setEditingExpense({...editingExpense, editAmount: e.target.value})} className="w-full p-3 border rounded-xl" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Concepto / Descripción</label>
                        <input type="text" value={editingExpense.editDesc} onChange={e => setEditingExpense({...editingExpense, editDesc: e.target.value})} className="w-full p-3 border rounded-xl" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-2 block">Categoría</label>
                        <select value={editingExpense.editCategory} onChange={e => setEditingExpense({...editingExpense, editCategory: e.target.value})} className="w-full p-3 border rounded-xl bg-white outline-none">
                            {editingExpense.type === 'income' 
                                ? ['Efectivo', 'Nequi', 'Bancolombia', 'Daviplata', 'Otro'].map(cat => <option key={cat} value={cat}>{cat}</option>)
                                : ['Insumos', 'Nómina', 'Infraestructura', 'Sanidad', 'Aves', 'Otros'].map(cat => <option key={cat} value={cat}>{cat}</option>)
                            }
                        </select>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow mt-2">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}