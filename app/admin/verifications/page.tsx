'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"


type VerificationRequest = {
    id: string;
    userId: string;
    idDocumentUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
};

type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    isVerified: boolean;
};

export default function AdminVerificationsPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchVerificationRequests();
        fetchUsers();
    }, []);

    const fetchVerificationRequests = async () => {
        try {
            const response = await fetch('/api/admin/verifications');
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            } else {
                throw new Error('Échec de la récupération des demandes de vérification');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des demandes de vérification');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                throw new Error('Échec de la récupération des utilisateurs');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des utilisateurs');
            console.error('Error:', error);
        }
    };

    const handleVerification = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await fetch(`/api/admin/verifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                const updatedRequest = await response.json();
                setRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
                setUsers(prev => prev.map(user =>
                    user.id === updatedRequest.userId
                        ? { ...user, isVerified: status === 'APPROVED' }
                        : user
                ));
                toast({
                    title: "Statut mis à jour",
                    description: `La demande a été ${status === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès.`,
                    variant: "default",
                });

                fetchVerificationRequests();
                fetchUsers();
            } else {
                throw new Error('Échec de la mise à jour du statut de vérification');
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Erreur lors de la mise à jour du statut de vérification",
                variant: "destructive",
            });
            console.error('Error:', error);
        }
    };


    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setUsers(users.filter(user => user.id !== userId));
                toast({
                    title: "Utilisateur supprimé",
                    description: "L'utilisateur a été supprimé avec succès.",
                    variant: "default",
                });

                if (userId === session?.user?.id) {
                    signOut({ callbackUrl: '/' });
                }
            } else {
                throw new Error('Échec de la suppression de l\'utilisateur');
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Erreur lors de la suppression de l'utilisateur",
                variant: "destructive",
            });
            console.error('Error:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    if (!session || session.user.role !== 'Admin') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Accès non autorisé</AlertTitle>
                <AlertDescription>
                    {` Vous n'avez pas les permissions nécessaires pour accéder à cette page.`}
                </AlertDescription>
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{`Panneau d'administration`}</h1>

            <Tabs defaultValue="verifications">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="verifications">Demandes de vérification</TabsTrigger>
                    <TabsTrigger value="users">Liste des utilisateurs</TabsTrigger>
                </TabsList>

                <TabsContent value="verifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Demandes de vérification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Date de soumission</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                {request.user.first_name} {request.user.last_name}
                                                <br />
                                                <span className="text-sm text-gray-500">{request.user.email}</span>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(request.submittedAt), 'Pp', { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    request.status === 'APPROVED' ? 'secondary' :
                                                        request.status === 'REJECTED' ? 'destructive' : 'default'
                                                }>
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline">Voir le document</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>{`Document d'identité`}</DialogTitle>
                                                            <DialogDescription>
                                                                Document soumis par {request.user.first_name} {request.user.last_name}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="mt-4">
                                                            <Image
                                                                src={request.idDocumentUrl}
                                                                alt="ID Document"
                                                                width={400}
                                                                height={300}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        {request.status === 'PENDING' && (
                                                            <div className="flex justify-end space-x-2 mt-4">
                                                                <Button onClick={() => handleVerification(request.id, 'APPROVED')} className="bg-green-500 hover:bg-green-600">
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approuver
                                                                </Button>
                                                                <Button onClick={() => handleVerification(request.id, 'REJECTED')} variant="destructive">
                                                                    <XCircle className="mr-2 h-4 w-4" /> Rejeter
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Liste des utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.first_name} {user.last_name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.isVerified ? 'secondary' : 'default'}>
                                                    {user.isVerified ? 'Vérifié' : 'Non vérifié'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    variant="destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            {`Êtes-vous sûr de vouloir supprimer l'utilisateur`} {userToDelete?.first_name} {userToDelete?.last_name} ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}