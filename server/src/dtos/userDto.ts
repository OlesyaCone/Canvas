import type { UserDtoType } from "../types/auth";

class UserDto implements UserDtoType {
    email: string;
    id: string;
    isActivated: boolean;
    displayName?: string;
    avatar?: string;
    provider: 'local' | 'google';

    constructor(model: any) {
        this.email = model.email;
        this.id = model._id?.toString() || model.id?.toString() || '';
        this.isActivated = model.isActivated || false;
        this.displayName = model.displayName || '';
        this.avatar = model.avatar || '';
        this.provider = model.provider || 'local';
    }
}

export default UserDto;