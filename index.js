import { REST, Routes, Client, GatewayIntentBits, ApplicationCommandOptionType } from 'discord.js';

// Define the commands
const commands = [
    {
        name: 'lifetime',
        description: 'Calculate the expected lifetime.',
        options: [
            {
                name: 'start_year',
                type: ApplicationCommandOptionType.Integer,
                description: 'Year of origin',
                required: true,
            },
            {
                name: 'confidence_interval',
                type: ApplicationCommandOptionType.Number,
                description: 'Confidence interval in percent (1-99)',
                required: true,
            },
        ],
    },
];

// Discord bot token and client ID
const TOKEN = "";
const CLIENT_ID = "";

// Register the commands
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Initialize the Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'lifetime') {
        const T_start = interaction.options.getInteger('start_year');
        const confidence_interval_percent = interaction.options.getNumber('confidence_interval');

        // Validate the confidence interval
        if (confidence_interval_percent < 1 || confidence_interval_percent > 99) {
            await interaction.reply('Confidence interval must be between 1 and 99.');
            return;
        }

        const result = calculateLifetime(T_start, confidence_interval_percent);
        await interaction.reply(`Will stop existing sometime between ${result.startYear} and ${result.endYear}`);
    }
});

client.login(TOKEN);

// Function to calculate lifetime
const calculateLifetime = (T_start, confidence_interval_percent) => {
    const T_now = new Date().getFullYear();
    const confidence_interval = confidence_interval_percent / 100;
    const ts = Math.abs(T_now - T_start);
    const z = (1 - confidence_interval) / 2;
    const t1 = (z / (1 - z)) * ts;
    const t2 = ((1 - z) / z) * ts;
    return {
        startYear: Math.round(t1 + T_now),
        endYear: Math.round(t2 + T_now),
    };
};
