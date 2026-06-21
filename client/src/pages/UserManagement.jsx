import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Users, Plus, Mail, Shield, UserPlus,
    ToggleLeft, ToggleRight, UserCog, Key
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, createUser, patchUser } from '../api/users'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { SkeletonTable } from '../components/Skeleton'
import { formatDate } from '../utils/formatters'

export default function UserManagement() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'MANAGER'
    })

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUsers().then(res => res.data)
    })

    const createMutation = useMutation({
        mutationFn: (data) => createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users'])
            setIsModalOpen(false)
            toast.success('User created successfully')
            setNewUser({ name: '', email: '', password: '', role: 'MANAGER' })
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to create user')
        }
    })

    const patchMutation = useMutation({
        mutationFn: ({ id, data }) => patchUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users'])
            toast.success('User updated')
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Update failed')
        }
    })

    const handleToggleActive = (user) => {
        patchMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })
    }

    const handleToggleRole = (user) => {
        const nextRole = user.role === 'ADMIN' ? 'MANAGER' : 'ADMIN'
        patchMutation.mutate({ id: user.id, data: { role: nextRole } })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        createMutation.mutate(newUser)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-primary">User Management</h1>
                        <p className="text-text-muted text-sm mt-0.5">Control system access and assign administrative roles</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <UserPlus size={18} />
                    Create User
                </button>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-bg/50 border-b border-border text-text-muted uppercase text-[10px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">User Info</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-6"><SkeletonTable rows={5} cols={5} /></td></tr>
                            ) : (
                                users?.map((user) => (
                                    <tr key={user.id} className={`table-row ${!user.isActive ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-primary to-accent' : 'bg-surface border border-border text-text-muted'
                                                        }`}>
                                                        {user.name[0]}
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${user.isActive ? 'bg-success' : 'bg-danger'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary">{user.name}</p>
                                                    <p className="text-xs text-text-muted flex items-center gap-1">
                                                        <Mail size={10} />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'} className="uppercase text-[10px] gap-1.5">
                                                <Shield size={10} />
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold ${user.isActive ? 'text-success' : 'text-danger'}`}>
                                                {user.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted font-mono text-xs">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleRole(user)}
                                                    title="Toggle Role"
                                                    className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-surface rounded-lg"
                                                >
                                                    <UserCog size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    title={user.isActive ? 'Disable User' : 'Enable User'}
                                                    className={`p-2 transition-colors hover:bg-surface rounded-lg ${user.isActive ? 'text-danger' : 'text-success'}`}
                                                >
                                                    {user.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New System User"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. John Doe"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="user@terragrid.com"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Initial Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="password"
                                required
                                className="input-field pl-10"
                                placeholder="Min 8 characters"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">System Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['MANAGER', 'ADMIN'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setNewUser({ ...newUser, role })}
                                    className={`py-3 px-4 rounded-btn border text-xs font-bold transition-all ${newUser.role === role
                                            ? 'bg-primary/20 border-primary text-primary shadow-glow'
                                            : 'bg-bg border-border text-text-muted hover:border-text-muted/50'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={createMutation.isLoading}
                        >
                            {createMutation.isLoading ? 'Processing...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
