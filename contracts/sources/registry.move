module username_registry::registry {
    use std::string::{Self, String};
    use one::event;
    use one::table::{Self, Table};

    /// Owned object representing a claimed username
    public struct Username has key, store {
        id: object::UID,
        handle: String,
        owner: address,
    }

    /// Shared registry — tracks all claimed handles
    public struct Registry has key {
        id: object::UID,
        /// handle -> owner address
        handles: Table<String, address>,
        total: u64,
    }

    public struct ClaimEvent has copy, drop {
        owner: address,
        handle: String,
        epoch: u64,
    }

    public struct ReleaseEvent has copy, drop {
        owner: address,
        handle: String,
    }

    const E_HANDLE_TAKEN: u64 = 0;
    const E_NOT_OWNER: u64 = 1;
    const E_HANDLE_TOO_SHORT: u64 = 2;

    /// Called once at publish — creates the shared Registry
    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            handles: table::new(ctx),
            total: 0,
        };
        transfer::share_object(registry);
    }

    /// Claim a unique username. Mints a Username object to the caller.
    public fun claim(
        registry: &mut Registry,
        raw_handle: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let handle = string::utf8(raw_handle);
        assert!(string::length(&handle) >= 3, E_HANDLE_TOO_SHORT);
        assert!(!table::contains(&registry.handles, handle), E_HANDLE_TAKEN);

        let sender = ctx.sender();
        table::add(&mut registry.handles, handle, sender);
        registry.total = registry.total + 1;

        event::emit(ClaimEvent {
            owner: sender,
            handle,
            epoch: ctx.epoch(),
        });

        let username = Username {
            id: object::new(ctx),
            handle,
            owner: sender,
        };
        transfer::transfer(username, sender);
    }

    /// Release a username back to the registry. Burns the Username object.
    public fun release(
        registry: &mut Registry,
        username: Username,
        ctx: &mut TxContext,
    ) {
        assert!(username.owner == ctx.sender(), E_NOT_OWNER);

        table::remove(&mut registry.handles, username.handle);
        registry.total = registry.total - 1;

        event::emit(ReleaseEvent {
            owner: username.owner,
            handle: username.handle,
        });

        let Username { id, handle: _, owner: _ } = username;
        object::delete(id);
    }

    /// Check if a handle is available
    public fun is_available(registry: &Registry, handle: String): bool {
        !table::contains(&registry.handles, handle)
    }

    /// Total claimed usernames
    public fun total(registry: &Registry): u64 {
        registry.total
    }

    // --- Username getters ---
    public fun handle(u: &Username): &String { &u.handle }
    public fun owner(u: &Username): address { u.owner }
}
