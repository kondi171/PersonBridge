import { Request, Response } from "express";
import userModel from "../models/users.model";
import bcrypt from 'bcrypt';

export const editName = async (req: Request, res: Response): Promise<void> => {
    const { id, name, password } = req.body;
    if (!id) {
        res.status(400).send({ error: 'ID is required!' });
        return;
    }
    if (!name) {
        res.status(400).send({ error: 'Name is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }
        if (user.name === name) {
            res.status(400).send({ error: 'New name is the same as the current one!' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send({ error: 'Invalid password!' });
            return;
        }
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: id },
            { $set: { name: name } },
            { new: true }
        );
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send(error);
    }
};


export const editLastname = async (req: Request, res: Response): Promise<void> => {
    const { id, lastname, password } = req.body;
    if (!id) {
        res.status(400).send({ error: 'ID is required!' });
        return;
    }
    if (!lastname) {
        res.status(400).send({ error: 'Lastname is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }
        if (user.lastname === lastname) {
            res.status(400).send({ error: 'New lastname is the same as the current one!' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send({ error: 'Invalid password!' });
            return;
        }
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: id },
            { $set: { lastname: lastname } },
            { new: true }
        );
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const editMail = async (req: Request, res: Response): Promise<void> => {
    const { id, mail, password } = req.body;
    if (!id) {
        res.status(400).send({ error: 'ID is required!' });
        return;
    }
    if (!mail) {
        res.status(400).send({ error: 'Mail is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }
        if (user.mail === mail) {
            res.status(400).send({ error: 'New mail is the same as the current one!' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send({ error: 'Invalid password!' });
            return;
        }
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: id },
            { $set: { mail: mail } },
            { new: true }
        );
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const editPassword = async (req: Request, res: Response): Promise<void> => {
    const { id, password, oldPassword } = req.body;

    if (!id) {
        res.status(400).send({ error: 'ID is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }
    if (!oldPassword) {
        res.status(400).send({ error: 'Old Password is required!' });
        return;
    }

    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }
        const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordMatch) {
            res.status(400).send({ error: 'Invalid old password!' });
            return;
        }
        if (await bcrypt.compare(password, user.password)) {
            res.status(400).send({ error: 'New password is the same as the current one!' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { $set: { password: hashedPassword } },
            { new: true }
        );
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send(error);
    }
};


export const deleteMessages = async (req: Request, res: Response): Promise<void> => {
    const { id, password } = req.body;

    if (!id) {
        res.status(400).send({ error: 'ID is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }

    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }

        // Sprawdzenie hasła
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.send({ error: 'Invalid password!' });
            return;
        }

        // Usunięcie wiadomości dla każdego przyjaciela
        const result = await userModel.updateMany(
            { "_id": id, "friends": { $exists: true } },
            { "$set": { "friends.$[].messages": [] } }
        );
        res.send({ message: "All messages have been deleted successfully!" });
    } catch (error) {
        console.error('Failed to delete messages:', error);
        res.status(500).send({ error: 'Failed to delete messages' });
    }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    const { id, password } = req.body;

    if (!id) {
        res.status(400).send({ error: 'ID is required!' });
        return;
    }
    if (!password) {
        res.status(400).send({ error: 'Password is required!' });
        return;
    }
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(404).send({ error: 'User not found!' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send({ error: 'Invalid password!' });
            return;
        }
        const deletedUser = await userModel.findByIdAndDelete(id);
        res.send(deletedUser);
    } catch (error) {
        console.error('Failed to delete account:', error);
        res.status(500).send({ error: 'Failed to delete account' });
    }
};


